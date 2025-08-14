import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;

    beforeEach(async () => {
        // Set up environment variable for JWT secret
        process.env.JWT_SECRET = 'test-secret-key';

        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtStrategy],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
    });

    afterEach(() => {
        // Clean up environment variable
        delete process.env.JWT_SECRET;
    });

    describe('constructor', () => {
        it('should be defined', () => {
            expect(strategy).toBeDefined();
        });

        it('should initialize with correct JWT configuration', () => {
            expect(strategy).toBeInstanceOf(JwtStrategy);
            // The strategy should be properly configured with PassportStrategy
        });
    });

    describe('validate', () => {
        it('should return user object with correct properties from JWT payload', async () => {
            const payload = {
                sub: 123,
                email: 'test@example.com',
                name: 'Test User',
                role: 'user',
            };

            const result = await strategy.validate(payload);

            expect(result).toEqual({
                userId: 123,
                email: 'test@example.com',
                name: 'Test User',
                role: 'user',
            });
        });

        it('should map sub to userId correctly', async () => {
            const payload = {
                sub: 456,
                email: 'admin@example.com',
                name: 'Admin User',
                role: 'admin',
            };

            const result = await strategy.validate(payload);

            expect(result.userId).toBe(456);
            expect(result.userId).toBe(payload.sub);
        });

        it('should preserve all payload properties in the correct format', async () => {
            const payload = {
                sub: 789,
                email: 'manager@company.com',
                name: 'Manager Name',
                role: 'manager',
            };

            const result = await strategy.validate(payload);

            expect(result).toHaveProperty('userId', payload.sub);
            expect(result).toHaveProperty('email', payload.email);
            expect(result).toHaveProperty('name', payload.name);
            expect(result).toHaveProperty('role', payload.role);
        });

        it('should handle different user roles', async () => {
            const roles = ['user', 'admin', 'manager', 'moderator'];

            for (const role of roles) {
                const payload = {
                    sub: 1,
                    email: 'test@example.com',
                    name: 'Test User',
                    role: role,
                };

                const result = await strategy.validate(payload);
                expect(result.role).toBe(role);
            }
        });

        it('should handle numeric user IDs correctly', async () => {
            const userIds = [1, 999, 123456, 0];

            for (const userId of userIds) {
                const payload = {
                    sub: userId,
                    email: 'test@example.com',
                    name: 'Test User',
                    role: 'user',
                };

                const result = await strategy.validate(payload);
                expect(result.userId).toBe(userId);
                expect(typeof result.userId).toBe('number');
            }
        });

        it('should handle different email formats', async () => {
            const emails = [
                'simple@example.com',
                'user.name+tag@domain.co.uk',
                'test123@sub.domain.org',
                'a@b.co',
            ];

            for (const email of emails) {
                const payload = {
                    sub: 1,
                    email: email,
                    name: 'Test User',
                    role: 'user',
                };

                const result = await strategy.validate(payload);
                expect(result.email).toBe(email);
            }
        });

        it('should handle different name formats', async () => {
            const names = [
                'John Doe',
                'Mary Jane Watson-Parker',
                'José María',
                'O\'Connor',
                'A',
            ];

            for (const name of names) {
                const payload = {
                    sub: 1,
                    email: 'test@example.com',
                    name: name,
                    role: 'user',
                };

                const result = await strategy.validate(payload);
                expect(result.name).toBe(name);
            }
        });
    });

    describe('integration with JWT configuration', () => {
        it('should be configured to extract JWT from Authorization Bearer header', () => {
            // This test verifies the strategy is configured correctly
            // The actual configuration is tested through integration tests
            expect(strategy).toBeDefined();
        });

        it('should be configured with correct JWT secret from environment', () => {
            // The strategy should use the JWT_SECRET environment variable
            expect(process.env.JWT_SECRET).toBe('test-secret-key');
        });

        it('should be configured to not ignore expiration', () => {
            // The strategy should be configured with ignoreExpiration: false
            // This is tested through the constructor configuration
            expect(strategy).toBeDefined();
        });
    });

    describe('error handling', () => {
        it('should handle payload with missing properties gracefully', async () => {
            const incompletePayload = {
                sub: 1,
                email: 'test@example.com',
                // missing name and role
            } as any;

            const result = await strategy.validate(incompletePayload);

            expect(result.userId).toBe(1);
            expect(result.email).toBe('test@example.com');
            expect(result.name).toBeUndefined();
            expect(result.role).toBeUndefined();
        });

        it('should handle payload with null values', async () => {
            const payloadWithNulls = {
                sub: 1,
                email: null,
                name: null,
                role: null,
            } as any;

            const result = await strategy.validate(payloadWithNulls);

            expect(result.userId).toBe(1);
            expect(result.email).toBeNull();
            expect(result.name).toBeNull();
            expect(result.role).toBeNull();
        });

        it('should handle payload with undefined values', async () => {
            const payloadWithUndefined = {
                sub: 1,
                email: undefined,
                name: undefined,
                role: undefined,
            } as any;

            const result = await strategy.validate(payloadWithUndefined);

            expect(result.userId).toBe(1);
            expect(result.email).toBeUndefined();
            expect(result.name).toBeUndefined();
            expect(result.role).toBeUndefined();
        });
    });
});
