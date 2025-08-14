import { CreateUserDto } from '../../users/dto/create-user.dto';

// We extend CreateUserDto 
// to reuse name/email/password validation 
// for registration as a best practice

export class RegisterDto extends CreateUserDto { }