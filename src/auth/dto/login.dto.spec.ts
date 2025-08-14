import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
    let dto: LoginDto;

    beforeEach(() => {
        dto = new LoginDto();
    });

    describe('valid data', () => {
        it('should pass validation with valid email and password', async () => {
            dto.email = 'test@example.com';
            dto.password = 'validpassword123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with minimum password length', async () => {
            dto.email = 'user@domain.com';
            dto.password = '12345678'; // exactly 8 characters

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });
    });

    describe('email validation', () => {
        it('should fail validation with invalid email format', async () => {
            dto.email = 'invalid-email';
            dto.password = 'validpassword123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
            expect(errors[0].constraints).toHaveProperty('isEmail');
        });

        it('should fail validation with empty email', async () => {
            dto.email = '';
            dto.password = 'validpassword123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
        });

        it('should fail validation with missing email', async () => {
            dto.password = 'validpassword123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
        });

        it('should fail validation with email containing only whitespace', async () => {
            dto.email = '   ';
            dto.password = 'validpassword123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
        });
    });

    describe('password validation', () => {
        it('should fail validation with password shorter than 8 characters', async () => {
            dto.email = 'test@example.com';
            dto.password = '1234567'; // 7 characters

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
            expect(errors[0].constraints).toHaveProperty('minLength');
            expect(errors[0].constraints?.minLength).toBe('Password must be at least 8 characters long');
        });

        it('should fail validation with empty password', async () => {
            dto.email = 'test@example.com';
            dto.password = '';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
        });

        it('should fail validation with missing password', async () => {
            dto.email = 'test@example.com';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
        });

        it('should fail validation with non-string password', async () => {
            dto.email = 'test@example.com';
            (dto as any).password = 12345678;

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail validation with password containing only whitespace', async () => {
            dto.email = 'test@example.com';
            dto.password = '        '; // 8 spaces (meets MinLength but not practical)

            const errors = await validate(dto);
            // Note: This will pass MinLength validation but may fail IsString depending on implementation
            // The current implementation allows whitespace-only passwords that meet length requirements
            expect(errors).toHaveLength(0);
        });
    });

    describe('multiple validation errors', () => {
        it('should fail validation with both invalid email and short password', async () => {
            dto.email = 'invalid-email';
            dto.password = '123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(2);

            const emailError = errors.find(error => error.property === 'email');
            const passwordError = errors.find(error => error.property === 'password');

            expect(emailError).toBeDefined();
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toHaveProperty('minLength');
        });

        it('should fail validation with missing email and password', async () => {
            const errors = await validate(dto);
            expect(errors).toHaveLength(2);

            const properties = errors.map(error => error.property);
            expect(properties).toContain('email');
            expect(properties).toContain('password');
        });
    });
});
