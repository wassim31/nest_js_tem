import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/entities/user-role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = {
    id: 'test-uuid',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.GUEST,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    // Reset all mocks before each test
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      name: 'New User',
      password: 'StrongPass123!',
    };

    it('should register a new user successfully', async () => {
      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toBe(mockUser);
    });

    it('should handle registration with all fields', async () => {
      const fullRegisterDto: RegisterDto = {
        ...registerDto,
        role: UserRole.GUEST,
      };
      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await controller.register(fullRegisterDto);

      expect(authService.register).toHaveBeenCalledWith(fullRegisterDto);
      expect(result).toBe(mockUser);
    });

    it('should handle registration errors', async () => {
      const error = new ConflictException('Email already exists');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow(ConflictException);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should handle validation errors', async () => {
      const invalidDto = { ...registerDto, email: 'invalid-email' } as RegisterDto;
      const error = new Error('Validation failed');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(invalidDto)).rejects.toThrow(error);
      expect(authService.register).toHaveBeenCalledWith(invalidDto);
    });

    it('should handle weak password errors', async () => {
      const weakPasswordDto = { ...registerDto, password: 'weak' } as RegisterDto;
      const error = new ConflictException('Password validation failed');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(weakPasswordDto)).rejects.toThrow(ConflictException);
      expect(authService.register).toHaveBeenCalledWith(weakPasswordDto);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'StrongPass123!',
    };

    const mockLoginResponse = {
      access_token: 'jwt-token-123',
    };

    let mockResponse: Partial<Response>;

    beforeEach(() => {
      mockResponse = {
        cookie: jest.fn().mockReturnThis(),
      };
    });

    it('should login user successfully and set cookie', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto, mockResponse as Response);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith('jwt', 'jwt-token-123', {
        httpOnly: true,
        secure: false, // NODE_ENV is not 'production' in tests
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
      });
      expect(result).toEqual({ 
        message: 'Login successful',
        user: { email: loginDto.email }
      });
    });

    it('should handle invalid credentials', async () => {
      const error = new UnauthorizedException('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto, mockResponse as Response)).rejects.toThrow(UnauthorizedException);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should handle user not found', async () => {
      const error = new UnauthorizedException('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      const invalidDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'StrongPass123!',
      };

      await expect(controller.login(invalidDto, mockResponse as Response)).rejects.toThrow(UnauthorizedException);
      expect(authService.login).toHaveBeenCalledWith(invalidDto);
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should handle wrong password', async () => {
      const error = new UnauthorizedException('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      const wrongPasswordDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      await expect(controller.login(wrongPasswordDto, mockResponse as Response)).rejects.toThrow(UnauthorizedException);
      expect(authService.login).toHaveBeenCalledWith(wrongPasswordDto);
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should return proper response structure', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto, mockResponse as Response);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('user');
      expect(result.message).toBe('Login successful');
      expect(result.user.email).toBe(loginDto.email);
    });
  });

  describe('error handling', () => {
    it('should propagate service errors correctly', async () => {
      const customError = new Error('Custom service error');
      mockAuthService.register.mockRejectedValue(customError);

      const registerDto: RegisterDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'StrongPass123!',
      };

      await expect(controller.register(registerDto)).rejects.toThrow('Custom service error');
    });

    it('should handle concurrent requests', async () => {
      mockAuthService.login.mockResolvedValue({ access_token: 'token' });
      const mockRes = { cookie: jest.fn().mockReturnThis() } as unknown as Response;

      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'StrongPass123!',
      };

      const promises = [
        controller.login(loginDto, mockRes),
        controller.login(loginDto, mockRes),
        controller.login(loginDto, mockRes),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(authService.login).toHaveBeenCalledTimes(3);
    });
  });

  describe('input validation integration', () => {
    it('should pass valid RegisterDto to service', async () => {
      const validDto: RegisterDto = {
        email: 'valid@example.com',
        name: 'Valid User',
        password: 'ValidPass123!',
        role: UserRole.GUEST,
      };
      mockAuthService.register.mockResolvedValue(mockUser);

      await controller.register(validDto);

      expect(authService.register).toHaveBeenCalledWith(validDto);
    });

    it('should pass valid LoginDto to service', async () => {
      const validDto: LoginDto = {
        email: 'valid@example.com',
        password: 'ValidPass123!',
      };
      const mockRes = { cookie: jest.fn().mockReturnThis() } as unknown as Response;
      mockAuthService.login.mockResolvedValue({ access_token: 'token' });

      await controller.login(validDto, mockRes);

      expect(authService.login).toHaveBeenCalledWith(validDto);
    });
  });
});
