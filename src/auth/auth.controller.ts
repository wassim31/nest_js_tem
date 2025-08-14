import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto, UnauthorizedResponseDto, BadRequestResponseDto } from './dto/auth-response.dto';
import type { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) { }

    @ApiOperation({
        summary: 'Register a new user',
        description: 'Creates a new user account with the provided credentials',
    })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({
        status: 201,
        description: 'User successfully registered',
        type: Object,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed or user already exists',
        type: BadRequestResponseDto,
    })
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.auth.register(dto);
    }

    @ApiOperation({
        summary: 'User login',
        description: 'Authenticates user and sets JWT token in HTTP-only cookie',
    })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 200,
        description: 'Login successful - JWT token set in HTTP-only cookie',
        type: LoginResponseDto,
        headers: {
            'Set-Cookie': {
                description: 'JWT token in HTTP-only cookie',
                schema: {
                    type: 'string',
                    example: 'jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Path=/; SameSite=Strict',
                },
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid credentials',
        type: UnauthorizedResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
        type: BadRequestResponseDto,
    })
    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.auth.login(loginDto);

        // Set JWT token in HTTP-only cookie
        res.cookie('jwt', result.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS in production
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        // Return success message and user info (without token for security)
        return {
            message: 'Login successful',
            user: {
                email: loginDto.email,
                // Additional user info can be added here if needed
            }
        };
    }
}
