import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user-role.enum';

@Injectable()
export class UsersService {
    private readonly saltRounds = 12; // Increased from 10 for better security

    constructor(@InjectRepository(User) private repo: Repository<User>) { }

    async create(dto: CreateUserDto, role: UserRole = UserRole.GUEST) {
        if (role === UserRole.OWNER) {
            throw new ForbiddenException('Cannot create owner via registration');
        }

        // Validate password strength
        const passwordValidation = this.validatePasswordStrength(dto.password);
        if (!passwordValidation.isValid) {
            throw new ConflictException(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
        }

        const existing = await this.repo.findOne({ where: { email: dto.email } });
        if (existing) throw new ConflictException('Email already registered');

        const passwordHash = await this.hashPassword(dto.password);
        const user = this.repo.create({
            name: dto.name,
            email: dto.email,
            password: passwordHash,
            role: UserRole.GUEST,
        });

        const saved = await this.repo.save(user);
        return this.safeUser(saved);
    }

    async findByEmailWithPassword(email: string): Promise<User | null> {
        return this.repo
            .createQueryBuilder('u')
            .addSelect('u.password')
            .where('u.email = :email', { email })
            .getOne();
    }

    async findById(id: string) {
        const user = await this.repo.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        return this.safeUser(user);
    }

    async findAll() {
        const users = await this.repo.find();
        return users.map(user => this.safeUser(user));
    }

    async findByEmail(email: string) {
        const user = await this.repo.findOne({ where: { email } });
        if (!user) throw new NotFoundException('User not found');
        return this.safeUser(user);
    }

    async update(id: string, dto: UpdateUserDto) {
        const user = await this.repo.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        // Check if email is being updated and if it already exists
        if (dto.email && dto.email !== user.email) {
            const existingUser = await this.repo.findOne({ where: { email: dto.email } });
            if (existingUser) {
                throw new ConflictException('Email already exists');
            }
        }

        // Hash password if provided
        if (dto.password) {
            // Validate password strength
            const passwordValidation = this.validatePasswordStrength(dto.password);
            if (!passwordValidation.isValid) {
                throw new ConflictException(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
            }
            dto.password = await this.hashPassword(dto.password);
        }

        // Update user
        Object.assign(user, dto);
        const updatedUser = await this.repo.save(user);
        return this.safeUser(updatedUser);
    }

    async remove(id: string) {
        const user = await this.repo.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');

        await this.repo.remove(user);
        return { message: 'User deleted successfully' };
    }

    private safeUser(user: User) {
        const { password, ...rest } = user;
        return rest;
    }

    /**
     * Compare a plain text password with a hashed password
     */
    async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Hash a password with the configured salt rounds
     */
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    /**
     * Validate password strength
     */
    validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/(?=.*[@$!%*?&])/.test(password)) {
            errors.push('Password must contain at least one special character (@$!%*?&)');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
