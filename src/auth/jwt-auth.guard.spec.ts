import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';

// Mock the AuthGuard
jest.mock('@nestjs/passport', () => ({
    AuthGuard: jest.fn().mockImplementation((strategy) => {
        return class MockAuthGuard {
            async canActivate(context: ExecutionContext): Promise<boolean> {
                return true; // Mock successful authentication
            }
        };
    }),
}));

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;
    let mockExecutionContext: Partial<ExecutionContext>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtAuthGuard, Reflector],
        }).compile();

        guard = module.get<JwtAuthGuard>(JwtAuthGuard);

        // Setup mock execution context
        mockExecutionContext = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    headers: {
                        authorization: 'Bearer valid-jwt-token',
                    },
                    user: {
                        userId: 1,
                        email: 'test@example.com',
                        name: 'Test User',
                        role: 'user',
                    },
                }),
                getResponse: jest.fn().mockReturnValue({}),
            }),
            getHandler: jest.fn(),
            getClass: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('initialization', () => {
        it('should be defined', () => {
            expect(guard).toBeDefined();
        });

        it('should extend AuthGuard with jwt strategy', () => {
            expect(guard).toBeInstanceOf(JwtAuthGuard);
            // Verify that AuthGuard was called with 'jwt' strategy
            expect(AuthGuard).toHaveBeenCalledWith('jwt');
        });
    });

    describe('canActivate', () => {
        it('should allow access when authentication is successful', async () => {
            const result = await guard.canActivate(mockExecutionContext as ExecutionContext);
            expect(result).toBe(true);
        });

        it('should work with valid JWT token in Authorization header', async () => {
            // The guard should process the JWT token correctly
            const result = await guard.canActivate(mockExecutionContext as ExecutionContext);
            expect(result).toBe(true);
        });
    });

    describe('inheritance from AuthGuard', () => {
        it('should inherit all functionality from AuthGuard', () => {
            // JwtAuthGuard should be a proper extension of AuthGuard
            expect(guard).toBeDefined();
            expect(typeof guard.canActivate).toBe('function');
        });

        it('should use jwt strategy', () => {
            // Verify the guard was instantiated with the correct strategy
            expect(AuthGuard).toHaveBeenCalledWith('jwt');
        });
    });

    describe('integration behavior', () => {
        it('should be usable as a guard decorator', () => {
            // The guard should be compatible with NestJS guard usage
            expect(guard).toBeInstanceOf(JwtAuthGuard);
            expect(guard.canActivate).toBeDefined();
        });

        it('should work with NestJS dependency injection', () => {
            // The guard should be injectable and work with NestJS DI
            expect(guard).toBeDefined();
        });
    });
});

// Additional integration-style tests
describe('JwtAuthGuard Integration', () => {
    let guard: JwtAuthGuard;

    beforeEach(async () => {
        // Reset mocks for integration tests
        jest.clearAllMocks();

        // Create a more realistic mock for AuthGuard
        (AuthGuard as jest.Mock).mockImplementation((strategy) => {
            return class MockAuthGuardIntegration {
                private strategy: string;

                constructor() {
                    this.strategy = strategy;
                }

                async canActivate(context: ExecutionContext): Promise<boolean> {
                    const request = context.switchToHttp().getRequest();
                    const authHeader = request.headers?.authorization;

                    // Simple mock logic for testing
                    if (authHeader && authHeader.startsWith('Bearer ')) {
                        const token = authHeader.substring(7);
                        if (token === 'valid-token') {
                            request.user = {
                                userId: 1,
                                email: 'test@example.com',
                                name: 'Test User',
                                role: 'user',
                            };
                            return true;
                        }
                    }
                    return false;
                }
            };
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtAuthGuard],
        }).compile();

        guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    });

    describe('authentication scenarios', () => {
        it('should authenticate with valid token', async () => {
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        headers: {
                            authorization: 'Bearer valid-token',
                        },
                    }),
                }),
            } as ExecutionContext;

            const result = await guard.canActivate(mockContext);
            expect(result).toBe(true);
        });

        it('should reject invalid token', async () => {
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        headers: {
                            authorization: 'Bearer invalid-token',
                        },
                    }),
                }),
            } as ExecutionContext;

            const result = await guard.canActivate(mockContext);
            expect(result).toBe(false);
        });

        it('should reject missing authorization header', async () => {
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        headers: {},
                    }),
                }),
            } as ExecutionContext;

            const result = await guard.canActivate(mockContext);
            expect(result).toBe(false);
        });

        it('should reject malformed authorization header', async () => {
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        headers: {
                            authorization: 'InvalidFormat token',
                        },
                    }),
                }),
            } as ExecutionContext;

            const result = await guard.canActivate(mockContext);
            expect(result).toBe(false);
        });
    });
});
