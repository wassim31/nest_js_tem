import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: 'test-uuid',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword123',
    role: UserRole.GUEST,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    // Reset all mocks before each test
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      name: 'New User',
      password: 'StrongPass123!',
    };

    it('should create a new user successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null); // Email doesn't exist
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
    });

    it('should throw ForbiddenException when trying to create owner', async () => {
      await expect(service.create(createUserDto, UserRole.OWNER)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException for weak password', async () => {
      const weakPasswordDto = { ...createUserDto, password: 'weak' };
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.create(weakPasswordDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('test-uuid');

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test-uuid' } });
      expect(result.id).toBe(mockUser.id);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const users = [mockUser, { ...mockUser, id: 'user2', email: 'user2@example.com' }];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
    });
  });

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException when user not found by email', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findByEmail('notfound@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should return user with password', async () => {
      const queryBuilder = {
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findByEmailWithPassword('test@example.com');

      expect(result).toBe(mockUser);
      expect(queryBuilder.addSelect).toHaveBeenCalledWith('u.password');
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    it('should update user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateDto };
      mockRepository.findOne
        .mockResolvedValueOnce(mockUser) // First call for finding user
        .mockResolvedValueOnce(null); // Second call for checking email uniqueness
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('test-uuid', updateDto);

      expect(result.name).toBe(updateDto.name);
      expect(result.email).toBe(updateDto.email);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when email already exists', async () => {
      const updateDtoWithDifferentEmail = { ...updateDto, email: 'different@example.com' };
      const existingUser = { ...mockUser, id: 'different-id', email: 'different@example.com' };
      mockRepository.findOne
        .mockResolvedValueOnce(mockUser) // User to update
        .mockResolvedValueOnce(existingUser); // Existing user with same email

      await expect(service.update('test-uuid', updateDtoWithDifferentEmail)).rejects.toThrow(ConflictException);
    });

    it('should hash password when provided in update', async () => {
      const updateWithPassword = { ...updateDto, password: 'NewPass123!' };
      mockRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);
      mockRepository.save.mockResolvedValue(mockUser);

      await service.update('test-uuid', updateWithPassword);

      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      mockRepository.findOne.mockResolvedValueOnce(mockUser);
      mockRepository.remove.mockResolvedValueOnce(mockUser);

      const result = await service.remove('test-uuid');

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test-uuid' } });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('password operations', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123!';
      const hashed = await service.hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
    });

    it('should compare passwords correctly', async () => {
      const password = 'testPassword123!';
      const hashed = await bcrypt.hash(password, 12);

      const isMatch = await service.comparePassword(password, hashed);
      const isNotMatch = await service.comparePassword('wrongPassword', hashed);

      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      const result = service.validatePasswordStrength('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const testCases = [
        { password: 'short', expectedErrors: 4 }, // length, uppercase, number, special
        { password: 'onlylowercase123!', expectedErrors: 1 }, // missing uppercase
        { password: 'ONLYUPPERCASE123!', expectedErrors: 1 }, // missing lowercase
        { password: 'NoNumbers!', expectedErrors: 1 }, // missing numbers
        { password: 'NoSpecialChars123', expectedErrors: 1 }, // missing special chars
      ];

      testCases.forEach(({ password, expectedErrors }) => {
        const result = service.validatePasswordStrength(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBe(expectedErrors);
      });
    });
  });
});
