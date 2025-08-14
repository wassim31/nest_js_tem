import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
    @ApiProperty({
        example: 'Login successful',
        description: 'Success message confirming login',
    })
    message: string;

    @ApiProperty({
        description: 'User information',
        type: 'object',
        properties: {
            email: {
                type: 'string',
                example: 'john.doe@example.com',
                description: 'User email address',
            },
        },
    })
    user: {
        email: string;
    };
}

export class UnauthorizedResponseDto {
    @ApiProperty({
        example: 401,
        description: 'HTTP status code',
    })
    statusCode: number;

    @ApiProperty({
        example: 'Invalid credentials',
        description: 'Error message',
    })
    message: string;

    @ApiProperty({
        example: 'Unauthorized',
        description: 'Error type',
    })
    error: string;
}

export class BadRequestResponseDto {
    @ApiProperty({
        example: 400,
        description: 'HTTP status code',
    })
    statusCode: number;

    @ApiProperty({
        example: ['email must be an email', 'password must be at least 8 characters long'],
        description: 'Validation error messages',
        type: [String],
    })
    message: string[];

    @ApiProperty({
        example: 'Bad Request',
        description: 'Error type',
    })
    error: string;
}
