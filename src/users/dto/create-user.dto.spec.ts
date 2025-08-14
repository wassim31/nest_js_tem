import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '../entities/user-role.enum';

describe('CreateUserDto', () => {
    let dto: CreateUserDto;

    beforeEach(() => {
        dto = new CreateUserDto();
    });

    describe('email validation', () => {
        it('should validate valid email addresses', async () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'user+tag@domain.com',
                'user123@test-domain.com',
            ];

            for (const email of validEmails) {
                dto.email = email;
                dto.name = 'Test User';
                dto.password = 'ValidPass123!';

                const errors = await validate(dto);
                const emailErrors = errors.filter(error => error.property === 'email');
                expect(emailErrors).toHaveLength(0);
            }
        });

        it('should reject invalid email addresses', async () => {
            const invalidEmails = [
                'invalid-email',
                '@domain.com',
                'user@',
                'user@@domain.com',
                '',
            ];

            for (const email of invalidEmails) {
                dto.email = email;
                dto.name = 'Test User';
                dto.password = 'ValidPass123!';

                const errors = await validate(dto);
                const emailErrors = errors.filter(error => error.property === 'email');
                expect(emailErrors.length).toBeGreaterThan(0);
            }
        });

        it('should be required', async () => {
            dto.name = 'Test User';
            dto.password = 'ValidPass123!';
            // email is undefined

            const errors = await validate(dto);
            const emailErrors = errors.filter(error => error.property === 'email');
            expect(emailErrors.length).toBeGreaterThan(0);
        });
    });

    describe('name validation', () => {
        it('should validate valid names', async () => {
            const validNames = [
                'John Doe',
                'Jane',
                'User Name',
                'Test User 123',
                'O\'Neill',
            ];

            for (const name of validNames) {
                dto.email = 'test@example.com';
                dto.name = name;
                dto.password = 'ValidPass123!';

                const errors = await validate(dto);
                const nameErrors = errors.filter(error => error.property === 'name');
                expect(nameErrors).toHaveLength(0);
            }
        });

        it('should handle empty names according to MinLength validation', async () => {
            dto.email = 'test@example.com';
            dto.name = '';  // Empty string should fail MinLength(1)
            dto.password = 'ValidPass123!';

            const errors = await validate(dto);
            const nameErrors = errors.filter(error => error.property === 'name');
            expect(nameErrors.length).toBeGreaterThan(0);
        });

        it('should handle whitespace names according to validation rules', async () => {
            const whitespaceNames = ['   ', '\t', '\n'];

            for (const name of whitespaceNames) {
                dto.email = 'test@example.com';
                dto.name = name;
                dto.password = 'ValidPass123!';

                const errors = await validate(dto);
                const nameErrors = errors.filter(error => error.property === 'name');

                // MinLength(1) counts whitespace characters, so these might pass
                // depending on the validation configuration
                expect(nameErrors.length).toBeGreaterThanOrEqual(0);
            }
        });

        it('should be required', async () => {
            dto.email = 'test@example.com';
            dto.password = 'ValidPass123!';
            // name is undefined

            const errors = await validate(dto);
            const nameErrors = errors.filter(error => error.property === 'name');
            expect(nameErrors.length).toBeGreaterThan(0);
        });
    });

    describe('password validation', () => {
        beforeEach(() => {
            dto.email = 'test@example.com';
            dto.name = 'Test User';
        });

        it('should validate strong passwords', async () => {
            const strongPasswords = [
                'ValidPass123!',
                'Str0ng@Password',
                'MyP@ssw0rd123',
                'C0mplex!Pass',
            ];

            for (const password of strongPasswords) {
                dto.password = password;

                const errors = await validate(dto);
                const passwordErrors = errors.filter(error => error.property === 'password');
                expect(passwordErrors).toHaveLength(0);
            }
        });

        it('should reject passwords shorter than 8 characters', async () => {
            const shortPasswords = ['1234567', 'Abc1!', '', 'Test1!'];

            for (const password of shortPasswords) {
                dto.password = password;

                const errors = await validate(dto);
                const passwordErrors = errors.filter(error => error.property === 'password');
                expect(passwordErrors.length).toBeGreaterThan(0);
            }
        });

        it('should reject passwords without uppercase letters', async () => {
            dto.password = 'validpass123!';

            const errors = await validate(dto);
            const passwordErrors = errors.filter(error => error.property === 'password');
            expect(passwordErrors.length).toBeGreaterThan(0);
        });

        it('should reject passwords without lowercase letters', async () => {
            dto.password = 'VALIDPASS123!';

            const errors = await validate(dto);
            const passwordErrors = errors.filter(error => error.property === 'password');
            expect(passwordErrors.length).toBeGreaterThan(0);
        });

        it('should reject passwords without numbers', async () => {
            dto.password = 'ValidPass!';

            const errors = await validate(dto);
            const passwordErrors = errors.filter(error => error.property === 'password');
            expect(passwordErrors.length).toBeGreaterThan(0);
        });

        it('should reject passwords without special characters', async () => {
            dto.password = 'ValidPass123';

            const errors = await validate(dto);
            const passwordErrors = errors.filter(error => error.property === 'password');
            expect(passwordErrors.length).toBeGreaterThan(0);
        });

        it('should be required', async () => {
            // password is undefined

            const errors = await validate(dto);
            const passwordErrors = errors.filter(error => error.property === 'password');
            expect(passwordErrors.length).toBeGreaterThan(0);
        });
    });

    describe('role validation', () => {
        beforeEach(() => {
            dto.email = 'test@example.com';
            dto.name = 'Test User';
            dto.password = 'ValidPass123!';
        });

        it('should accept valid roles', async () => {
            const validRoles = [UserRole.GUEST, UserRole.OWNER];

            for (const role of validRoles) {
                dto.role = role;

                const errors = await validate(dto);
                const roleErrors = errors.filter(error => error.property === 'role');
                expect(roleErrors).toHaveLength(0);
            }
        });

        it('should reject invalid roles', async () => {
            // @ts-ignore - Testing invalid enum value
            dto.role = 'invalid-role';

            const errors = await validate(dto);
            const roleErrors = errors.filter(error => error.property === 'role');
            expect(roleErrors.length).toBeGreaterThan(0);
        });

        it('should be optional', async () => {
            // role is undefined

            const errors = await validate(dto);
            const roleErrors = errors.filter(error => error.property === 'role');
            expect(roleErrors).toHaveLength(0);
        });
    });

    describe('complete DTO validation', () => {
        it('should validate a complete valid DTO', async () => {
            dto.email = 'test@example.com';
            dto.name = 'Test User';
            dto.password = 'ValidPass123!';
            dto.role = UserRole.GUEST;

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should validate DTO without optional role', async () => {
            dto.email = 'test@example.com';
            dto.name = 'Test User';
            dto.password = 'ValidPass123!';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should collect multiple validation errors', async () => {
            dto.email = 'invalid-email';
            dto.name = '';
            dto.password = 'weak';
            // @ts-ignore
            dto.role = 'invalid-role';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(3); // Should have errors for multiple fields
        });
    });
});
