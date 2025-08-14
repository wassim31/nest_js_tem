import { IsEmail, IsString, MinLength, IsOptional, IsEnum, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address for the user account',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    minLength: 8,
    format: 'password',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
  })
  password: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.GUEST,
    description: 'User role - defaults to GUEST if not specified',
    default: UserRole.GUEST,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
