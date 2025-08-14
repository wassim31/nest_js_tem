import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtAuthGuard],
        }).compile();

        guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    });

    describe('initialization', () => {
        it('should be defined', () => {
            expect(guard).toBeDefined();
        });

        it('should be an instance of JwtAuthGuard', () => {
            expect(guard).toBeInstanceOf(JwtAuthGuard);
        });
    });

    describe('guard functionality', () => {
        it('should have canActivate method', () => {
            expect(guard.canActivate).toBeDefined();
            expect(typeof guard.canActivate).toBe('function');
        });

        it('should be compatible with NestJS guard interface', () => {
            // The guard should be properly structured for NestJS DI
            expect(guard).toBeDefined();
            expect(guard.canActivate).toBeDefined();
        });
    });

    describe('integration behavior', () => {
        it('should be usable as a guard decorator', () => {
            // The guard should be compatible with NestJS guard usage
            expect(guard).toBeInstanceOf(JwtAuthGuard);
            expect(guard.canActivate).toBeDefined();
        });

        it('should work with NestJS dependency injection', () => {
            // The guard should be injectable and work with NestJS DI
            expect(guard).toBeDefined();
        });
    });
});
