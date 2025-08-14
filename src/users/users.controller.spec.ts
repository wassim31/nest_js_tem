import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user-role.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 'test-uuid',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.GUEST,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      name: 'New User',
      password: 'StrongPass123!',
    };

    it('should create a new user successfully', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toBe(mockUser);
    });

    it('should handle creation errors', async () => {
      mockUsersService.create.mockRejectedValue(new ConflictException('Email already registered'));

      await expect(controller.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle weak password errors', async () => {
      const weakPasswordDto = { ...createUserDto, password: 'weak' };
      mockUsersService.create.mockRejectedValue(
        new ConflictException('Password validation failed: Password must be at least 8 characters long')
      );

      await expect(controller.create(weakPasswordDto)).rejects.toThrow(ConflictException);
      expect(service.create).toHaveBeenCalledWith(weakPasswordDto);
    });

    it('should create user with valid DTO', async () => {
      const validDto: CreateUserDto = {
        email: 'valid@example.com',
        name: 'Valid User',
        password: 'ValidPass123!',
      };
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(validDto);

      expect(service.create).toHaveBeenCalledWith(validDto);
      expect(result).toBe(mockUser);
    });
  });

  describe('findOne', () => {
    it('should find user by id successfully', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(service.findById).toHaveBeenCalledWith('1');
      expect(result).toBe(mockUser);
    });

    it('should handle user not found by id', async () => {
      mockUsersService.findById.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(service.findById).toHaveBeenCalledWith('999');
    });

    it('should handle various numeric id formats', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      // Test different numeric formats
      await controller.findOne(1);
      await controller.findOne(999);
      await controller.findOne(123456);

      expect(service.findById).toHaveBeenNthCalledWith(1, '1');
      expect(service.findById).toHaveBeenNthCalledWith(2, '999');
      expect(service.findById).toHaveBeenNthCalledWith(3, '123456');
    });

    it('should convert id parameter to string correctly', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne(12345);

      expect(service.findById).toHaveBeenCalledWith('12345');
      expect(result).toBe(mockUser);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    it('should update user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, updateUserDto);

      expect(service.update).toHaveBeenCalledWith('1', updateUserDto);
      expect(result).toBe(updatedUser);
    });

    it('should handle user not found during update', async () => {
      mockUsersService.update.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.update(999, updateUserDto)).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith('999', updateUserDto);
    });

    it('should handle email conflict during update', async () => {
      mockUsersService.update.mockRejectedValue(new ConflictException('Email already exists'));

      await expect(controller.update(1, updateUserDto)).rejects.toThrow(ConflictException);
      expect(service.update).toHaveBeenCalledWith('1', updateUserDto);
    });

    it('should update user with partial data', async () => {
      const partialUpdate = { name: 'Only Name Update' };
      const updatedUser = { ...mockUser, name: partialUpdate.name };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, partialUpdate);

      expect(service.update).toHaveBeenCalledWith('1', partialUpdate);
      expect(result).toBe(updatedUser);
    });

    it('should handle password update', async () => {
      const passwordUpdate = { password: 'NewStrongPass123!' };
      const updatedUser = { ...mockUser };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, passwordUpdate);

      expect(service.update).toHaveBeenCalledWith('1', passwordUpdate);
      expect(result).toBe(updatedUser);
    });

    it('should handle weak password in update', async () => {
      const weakPasswordUpdate = { password: 'weak' };
      mockUsersService.update.mockRejectedValue(
        new ConflictException('Password validation failed: Password must be at least 8 characters long')
      );

      await expect(controller.update(1, weakPasswordUpdate)).rejects.toThrow(ConflictException);
      expect(service.update).toHaveBeenCalledWith('1', weakPasswordUpdate);
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      const deleteResult = { message: 'User deleted successfully' };
      mockUsersService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toBe(deleteResult);
    });

    it('should handle user not found during removal', async () => {
      mockUsersService.remove.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith('999');
    });

    it('should convert numeric id to string for service call', async () => {
      const deleteResult = { message: 'User deleted successfully' };
      mockUsersService.remove.mockResolvedValue(deleteResult);

      await controller.remove(123);

      expect(service.remove).toHaveBeenCalledWith('123');
    });

    it('should handle deletion of non-existent user', async () => {
      mockUsersService.remove.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.remove(999999)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith('999999');
    });
  });

  describe('error handling', () => {
    it('should propagate service errors correctly', async () => {
      const customError = new Error('Custom service error');
      mockUsersService.findById.mockRejectedValue(customError);

      await expect(controller.findOne(1)).rejects.toThrow('Custom service error');
    });

    it('should handle multiple concurrent requests', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const promises = [
        controller.findOne(1),
        controller.findOne(2),
        controller.findOne(3),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(service.findById).toHaveBeenCalledTimes(3);
    });

    it('should handle various error types from service', async () => {
      // Test different error scenarios
      const errorScenarios = [
        { method: 'create', error: new ConflictException('Email already exists') },
        { method: 'findById', error: new NotFoundException('User not found') },
        { method: 'update', error: new ConflictException('Email already exists') },
        { method: 'remove', error: new NotFoundException('User not found') },
      ];

      for (const scenario of errorScenarios) {
        mockUsersService[scenario.method].mockRejectedValueOnce(scenario.error);

        if (scenario.method === 'create') {
          await expect(controller.create({
            email: 'test@test.com',
            name: 'Test',
            password: 'Test123!'
          })).rejects.toThrow(scenario.error);
        } else if (scenario.method === 'findById') {
          await expect(controller.findOne(1)).rejects.toThrow(scenario.error);
        } else if (scenario.method === 'update') {
          await expect(controller.update(1, { name: 'Updated' })).rejects.toThrow(scenario.error);
        } else if (scenario.method === 'remove') {
          await expect(controller.remove(1)).rejects.toThrow(scenario.error);
        }
      }
    });
  });

  describe('input validation', () => {
    it('should pass valid CreateUserDto to service', async () => {
      const validDto: CreateUserDto = {
        email: 'valid@example.com',
        name: 'Valid User',
        password: 'ValidPass123!',
        role: UserRole.GUEST,
      };
      mockUsersService.create.mockResolvedValue(mockUser);

      await controller.create(validDto);

      expect(service.create).toHaveBeenCalledWith(validDto);
    });

    it('should pass valid UpdateUserDto to service', async () => {
      const validDto: UpdateUserDto = {
        email: 'updated@example.com',
        name: 'Updated User',
        password: 'UpdatedPass123!',
      };
      mockUsersService.update.mockResolvedValue(mockUser);

      await controller.update(1, validDto);

      expect(service.update).toHaveBeenCalledWith('1', validDto);
    });
  });
});
