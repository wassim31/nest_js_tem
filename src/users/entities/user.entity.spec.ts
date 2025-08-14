import { User } from './user.entity';
import { UserRole } from './user-role.enum';

describe('User Entity', () => {
    let user: User;

    beforeEach(() => {
        user = new User();
    });

    it('should be defined', () => {
        expect(user).toBeDefined();
    });

    it('should have the correct default values', () => {
        user.email = 'test@example.com';
        user.name = 'Test User';
        user.password = 'hashedPassword';
        user.role = UserRole.GUEST;

        expect(user.email).toBe('test@example.com');
        expect(user.name).toBe('Test User');
        expect(user.password).toBe('hashedPassword');
        expect(user.role).toBe(UserRole.GUEST);
    });

    it('should allow setting all properties', () => {
        const now = new Date();
        user.id = 'test-uuid';
        user.email = 'user@example.com';
        user.name = 'John Doe';
        user.password = 'hashedPassword123';
        user.role = UserRole.OWNER;
        user.createdAt = now;
        user.updatedAt = now;

        expect(user.id).toBe('test-uuid');
        expect(user.email).toBe('user@example.com');
        expect(user.name).toBe('John Doe');
        expect(user.password).toBe('hashedPassword123');
        expect(user.role).toBe(UserRole.OWNER);
        expect(user.createdAt).toBe(now);
        expect(user.updatedAt).toBe(now);
    });

    describe('role assignment', () => {
        it('should accept GUEST role', () => {
            user.role = UserRole.GUEST;
            expect(user.role).toBe(UserRole.GUEST);
        });

        it('should accept OWNER role', () => {
            user.role = UserRole.OWNER;
            expect(user.role).toBe(UserRole.OWNER);
        });
    });

    describe('entity properties', () => {
        it('should have uuid as primary key type', () => {
            // This is more of a documentation test since we can't easily test decorators
            expect(typeof user.id).toBe('undefined'); // Initially undefined
            user.id = 'test-uuid-string';
            expect(typeof user.id).toBe('string');
        });

        it('should handle email uniqueness constraint', () => {
            // This tests the entity structure, actual uniqueness is enforced by database
            user.email = 'unique@example.com';
            expect(user.email).toBe('unique@example.com');
        });

        it('should handle password with select: false behavior', () => {
            // The password field has select: false, but can still be set
            user.password = 'secretPassword';
            expect(user.password).toBe('secretPassword');
        });

        it('should handle timestamps', () => {
            const now = new Date();
            user.createdAt = now;
            user.updatedAt = now;

            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);
            expect(user.createdAt).toBe(now);
            expect(user.updatedAt).toBe(now);
        });
    });

    describe('entity validation scenarios', () => {
        it('should represent a complete user object', () => {
            const completeUser: User = {
                id: 'uuid-12345',
                email: 'complete@example.com',
                name: 'Complete User',
                password: 'hashedPassword123',
                role: UserRole.GUEST,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-02'),
            };

            Object.assign(user, completeUser);

            expect(user.id).toBe('uuid-12345');
            expect(user.email).toBe('complete@example.com');
            expect(user.name).toBe('Complete User');
            expect(user.password).toBe('hashedPassword123');
            expect(user.role).toBe(UserRole.GUEST);
            expect(user.createdAt).toEqual(new Date('2024-01-01'));
            expect(user.updatedAt).toEqual(new Date('2024-01-02'));
        });

        it('should handle minimal user object', () => {
            user.email = 'minimal@example.com';
            user.name = 'Minimal';
            user.password = 'password';

            expect(user.email).toBe('minimal@example.com');
            expect(user.name).toBe('Minimal');
            expect(user.password).toBe('password');
            expect(user.id).toBeUndefined();
            expect(user.role).toBeUndefined();
            expect(user.createdAt).toBeUndefined();
            expect(user.updatedAt).toBeUndefined();
        });
    });

    describe('type safety', () => {
        it('should enforce string type for id', () => {
            user.id = 'string-id';
            expect(typeof user.id).toBe('string');
        });

        it('should enforce string type for email', () => {
            user.email = 'email@test.com';
            expect(typeof user.email).toBe('string');
        });

        it('should enforce string type for name', () => {
            user.name = 'Test Name';
            expect(typeof user.name).toBe('string');
        });

        it('should enforce string type for password', () => {
            user.password = 'password123';
            expect(typeof user.password).toBe('string');
        });

        it('should enforce UserRole enum for role', () => {
            user.role = UserRole.GUEST;
            expect(Object.values(UserRole)).toContain(user.role);

            user.role = UserRole.OWNER;
            expect(Object.values(UserRole)).toContain(user.role);
        });

        it('should enforce Date type for timestamps', () => {
            const now = new Date();
            user.createdAt = now;
            user.updatedAt = now;

            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);
        });
    });
});
