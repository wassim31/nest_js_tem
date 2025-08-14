import { IsOptional, IsString, MinLength, IsEmail, IsEnum, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user-role.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'john.doe@example.com',
    description: 'New email address for the user account',
    format: 'email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'New full name of the user',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({
    example: 'NewStrongPassword123!',
    description: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    minLength: 8,
    format: 'password',
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
  })
  password?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.OWNER,
    description: 'New user role',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
