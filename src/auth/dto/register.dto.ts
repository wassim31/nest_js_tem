import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto/create-user.dto';

// We extend CreateUserDto 
// to reuse name/email/password validation 
// for registration as a best practice

export class RegisterDto extends CreateUserDto {
    @ApiProperty({
        example: 'John Doe',
        description: 'Full name of the user',
        minLength: 2,
    })
    declare name: string;

    @ApiProperty({
        example: 'john.doe@example.com',
        description: 'Email address for the user account',
        format: 'email',
    })
    declare email: string;

    @ApiProperty({
        example: 'StrongPassword123!',
        description: 'Password for the user account',
        minLength: 8,
        format: 'password',
    })
    declare password: string;
}