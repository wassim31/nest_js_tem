import { Exclude } from 'class-transformer';
import { UserRole } from '../entities/user-role.enum';

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
