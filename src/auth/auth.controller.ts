import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.auth.register(dto);
    }

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
