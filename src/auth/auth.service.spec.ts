import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/entities/user-role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 'test-uuid',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword123',
    role: UserRole.GUEST,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSafeUser = {
    id: 'test-uuid',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.GUEST,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    comparePassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks before each test
    jest.resetAllMocks();

    // Set up environment variables for JWT
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES = '1h';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      name: 'New User',
      password: 'StrongPass123!',
    };

    it('should register a new user successfully', async () => {
      mockUsersService.create.mockResolvedValue(mockSafeUser);

      const result = await service.register(registerDto);

      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(result).toBe(mockSafeUser);
    });

    it('should handle registration errors from users service', async () => {
      const error = new Error('Email already exists');
      mockUsersService.create.mockRejectedValue(error);

      await expect(service.register(registerDto)).rejects.toThrow(error);
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
    });

    it('should pass through user service validation', async () => {
      mockUsersService.create.mockResolvedValue(mockSafeUser);

      await service.register(registerDto);

      expect(usersService.create).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'StrongPass123!',
    };

    it('should login user successfully', async () => {
      const expectedToken = 'jwt-token-123';
      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockUsersService.comparePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await service.login(loginDto);

      expect(usersService.findByEmailWithPassword).toHaveBeenCalledWith(loginDto.email);
      expect(usersService.comparePassword).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
        {
          secret: 'test-secret',
          expiresIn: '1h',
        }
      );
      expect(result).toEqual({ access_token: expectedToken });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(usersService.findByEmailWithPassword).toHaveBeenCalledWith(loginDto.email);
      expect(usersService.comparePassword).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockUsersService.comparePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(usersService.findByEmailWithPassword).toHaveBeenCalledWith(loginDto.email);
      expect(usersService.comparePassword).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should use correct JWT payload structure', async () => {
      const expectedToken = 'jwt-token-456';
      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockUsersService.comparePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(expectedToken);

      await service.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
        expect.objectContaining({
          secret: 'test-secret',
          expiresIn: '1h',
        })
      );
    });

    it('should handle different user roles', async () => {
      const ownerUser = { ...mockUser, role: UserRole.OWNER };
      const expectedToken = 'jwt-token-owner';

      mockUsersService.findByEmailWithPassword.mockResolvedValue(ownerUser);
      mockUsersService.comparePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await service.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          role: UserRole.OWNER,
        }),
        expect.any(Object)
      );
      expect(result).toEqual({ access_token: expectedToken });
    });

    it('should handle service errors gracefully', async () => {
      mockUsersService.findByEmailWithPassword.mockRejectedValue(new Error('Database error'));

      await expect(service.login(loginDto)).rejects.toThrow('Database error');
      expect(usersService.findByEmailWithPassword).toHaveBeenCalledWith(loginDto.email);
    });
  });

  describe('integration with users service', () => {
    it('should properly use users service password comparison', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'PlaintextPassword123!',
      };

      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockUsersService.comparePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('token');

      await service.login(loginDto);

      // Verify we're using the service method, not direct bcrypt
      expect(usersService.comparePassword).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password
      );
    });

    it('should work with users service create method for registration', async () => {
      const registerDto: RegisterDto = {
        email: 'new@example.com',
        name: 'New User',
        password: 'NewPassword123!',
      };

      mockUsersService.create.mockResolvedValue(mockSafeUser);

      const result = await service.register(registerDto);

      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(result).toBe(mockSafeUser);
    });
  });

  describe('error scenarios', () => {
    it('should provide consistent error messages for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Test user not found
      mockUsersService.findByEmailWithPassword.mockResolvedValue(null);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');

      // Test wrong password
      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockUsersService.comparePassword.mockResolvedValue(false);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should handle concurrent login attempts', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'StrongPass123!',
      };

      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockUsersService.comparePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('token');

      const promises = [
        service.login(loginDto),
        service.login(loginDto),
        service.login(loginDto),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(usersService.findByEmailWithPassword).toHaveBeenCalledTimes(3);
      expect(usersService.comparePassword).toHaveBeenCalledTimes(3);
      expect(jwtService.sign).toHaveBeenCalledTimes(3);
    });
  });
});
