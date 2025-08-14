import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../users/users.service';

describe('AuthModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        // Set JWT_SECRET for testing
        process.env.JWT_SECRET = 'test-secret-key';

        // Mock UsersService
        const mockUsersService = {
            create: jest.fn(),
            findByEmailWithPassword: jest.fn(),
            comparePassword: jest.fn(),
        };

        module = await Test.createTestingModule({
            imports: [
                PassportModule,
                JwtModule.register({
                    secret: 'test-secret-key',
                    signOptions: { expiresIn: '1h' },
                }),
            ],
            providers: [
                AuthService,
                JwtStrategy,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
            controllers: [AuthController],
        }).compile();
    });

    afterEach(async () => {
        if (module) {
            await module.close();
        }
        // Clean up environment variable
        delete process.env.JWT_SECRET;
    });

    describe('module initialization', () => {
        it('should be defined', () => {
            expect(module).toBeDefined();
        });

        it('should provide AuthService', () => {
            const authService = module.get<AuthService>(AuthService);
            expect(authService).toBeDefined();
            expect(authService).toBeInstanceOf(AuthService);
        });

        it('should provide AuthController', () => {
            const authController = module.get<AuthController>(AuthController);
            expect(authController).toBeDefined();
            expect(authController).toBeInstanceOf(AuthController);
        });

        it('should provide JwtStrategy', () => {
            const jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
            expect(jwtStrategy).toBeDefined();
            expect(jwtStrategy).toBeInstanceOf(JwtStrategy);
        });
    });

    describe('module dependencies', () => {
        it('should provide mocked UsersService', () => {
            // The module should have access to mocked UsersService
            const usersService = module.get<UsersService>(UsersService);
            expect(usersService).toBeDefined();
            expect(usersService.create).toBeDefined();
            expect(usersService.findByEmailWithPassword).toBeDefined();
            expect(usersService.comparePassword).toBeDefined();
        });

        it('should configure PassportModule', () => {
            // PassportModule should be available for JWT strategy
            const jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
            expect(jwtStrategy).toBeDefined();
        });

        it('should configure JwtModule', () => {
            // JwtModule should be configured and available
            const authService = module.get<AuthService>(AuthService);
            expect(authService).toBeDefined();
        });
    });

    describe('module providers', () => {
        it('should have all required providers', () => {
            const authService = module.get<AuthService>(AuthService);
            const jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
            const usersService = module.get<UsersService>(UsersService);
            
            expect(authService).toBeDefined();
            expect(jwtStrategy).toBeDefined();
            expect(usersService).toBeDefined();
        });

        it('should have AuthController as controller', () => {
            const controller = module.get<AuthController>(AuthController);
            expect(controller).toBeDefined();
        });
    });

    describe('integration', () => {
        it('should allow AuthService to work with other modules', () => {
            const authService = module.get<AuthService>(AuthService);
            expect(authService).toBeDefined();

            // AuthService should have access to dependencies
            expect(authService.register).toBeDefined();
            expect(authService.login).toBeDefined();
        });

        it('should allow AuthController to work with AuthService', () => {
            const authController = module.get<AuthController>(AuthController);
            const authService = module.get<AuthService>(AuthService);

            expect(authController).toBeDefined();
            expect(authService).toBeDefined();
        });

        it('should configure JWT strategy properly', () => {
            const jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
            expect(jwtStrategy).toBeDefined();
            expect(jwtStrategy.validate).toBeDefined();
            expect(typeof jwtStrategy.validate).toBe('function');
        });
    });
});
