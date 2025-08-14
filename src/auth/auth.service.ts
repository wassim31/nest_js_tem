import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwt: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        return this.usersService.create(dto);
    }

    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmailWithPassword(dto.email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const passwordValid = await this.usersService.comparePassword(dto.password, user.password);
        if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };

        return {
            access_token: this.jwt.sign(payload, {
                secret: process.env.JWT_SECRET,
                expiresIn: process.env.JWT_EXPIRES,
            }),
        };
    }
}
