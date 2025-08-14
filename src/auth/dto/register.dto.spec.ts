import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
    let dto: RegisterDto;

    beforeEach(() => {
        dto = new RegisterDto();
    });

    describe('inheritance from CreateUserDto', () => {
        it('should inherit all validation rules from CreateUserDto', async () => {
            // Valid data should pass
            dto.name = 'John Doe';
            dto.email = 'john@example.com';
            dto.password = 'ValidPass123!'; // Strong password

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should validate name field (inherited)', async () => {
            dto.email = 'test@example.com';
            dto.password = 'ValidPass123!';
            // Missing name

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('name');
        });

        it('should validate email field (inherited)', async () => {
            dto.name = 'John Doe';
            dto.password = 'ValidPass123!';
            dto.email = 'invalid-email';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
            expect(errors[0].constraints).toHaveProperty('isEmail');
        });

        it('should validate password field (inherited)', async () => {
            dto.name = 'John Doe';
            dto.email = 'test@example.com';
            dto.password = '123'; // Too short

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
            expect(errors[0].constraints).toHaveProperty('minLength');
        });
    });

    describe('valid registration data', () => {
        it('should pass validation with all required fields', async () => {
            dto.name = 'Jane Smith';
            dto.email = 'jane.smith@example.com';
            dto.password = 'SecurePass123!';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with minimum length values', async () => {
            dto.name = 'A'; // minimum 1 character (from CreateUserDto)
            dto.email = 'a@b.co';
            dto.password = 'Test123!'; // minimum 8 characters with strong password

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with special characters in name', async () => {
            dto.name = "O'Connor-Smith Jr.";
            dto.email = 'oconnor@example.com';
            dto.password = 'ValidPass123!';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });
    });

    describe('invalid registration data', () => {
        it('should fail validation with missing name', async () => {
            dto.email = 'test@example.com';
            dto.password = 'ValidPass123!';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThanOrEqual(1);
            expect(errors.some(error => error.property === 'name')).toBe(true);
        });

        it('should fail validation with empty name', async () => {
            dto.name = '';
            dto.email = 'test@example.com';
            dto.password = 'ValidPass123!';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThanOrEqual(1);
            expect(errors.some(error => error.property === 'name')).toBe(true);
        });

        it('should pass validation with name containing only whitespace (current behavior)', async () => {
            dto.name = '   '; // Note: Current validation accepts whitespace-only names
            dto.email = 'test@example.com';
            dto.password = 'ValidPass123!';

            const errors = await validate(dto);
            // Current behavior: whitespace-only names pass MinLength(1) validation
            expect(errors).toHaveLength(0);
        });

        it('should fail validation with invalid email format', async () => {
            dto.name = 'John Doe';
            dto.email = 'not-an-email';
            dto.password = 'ValidPass123!';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThanOrEqual(1);
            expect(errors.some(error => error.property === 'email')).toBe(true);
        });

        it('should fail validation with password too short', async () => {
            dto.name = 'John Doe';
            dto.email = 'john@example.com';
            dto.password = 'short';

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('password');
        });
    });

    describe('multiple validation errors', () => {
        it('should fail validation with all fields invalid', async () => {
            dto.name = '';
            dto.email = 'invalid-email';
            dto.password = '123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(3);

            const properties = errors.map(error => error.property);
            expect(properties).toContain('name');
            expect(properties).toContain('email');
            expect(properties).toContain('password');
        });

        it('should fail validation with missing all fields', async () => {
            const errors = await validate(dto);
            expect(errors).toHaveLength(3);

            const properties = errors.map(error => error.property);
            expect(properties).toContain('name');
            expect(properties).toContain('email');
            expect(properties).toContain('password');
        });
    });

    describe('edge cases', () => {
        it('should handle non-string values gracefully', async () => {
            (dto as any).name = 123;
            (dto as any).email = true;
            (dto as any).password = [];

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);

            const properties = errors.map(error => error.property);
            expect(properties).toContain('name');
            expect(properties).toContain('email');
            expect(properties).toContain('password');
        });

        it('should validate with long but valid input', async () => {
            dto.name = 'A'.repeat(100); // Very long name
            dto.email = 'very.long.email.address.with.many.parts@example.com';
            dto.password = 'VeryLong123!@#'; // Strong password

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });
    });
});
