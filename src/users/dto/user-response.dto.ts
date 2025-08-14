import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user-role.enum';

export class UserResponseDto {
  @ApiProperty({
    example: 'e7b0a7a5-8b1a-4c9e-9d5a-1a2b3c4d5e6f',
    description: 'Unique identifier for the user',
  })
  id: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  name: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.GUEST,
    description: 'Role of the user',
  })
  role: UserRole;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
