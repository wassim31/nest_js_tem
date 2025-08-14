import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersModule } from './users.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersModule', () => {
    let module: TestingModule;
    let controller: UsersController;
    let service: UsersService;

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        remove: jest.fn(),
        createQueryBuilder: jest.fn(),
    };

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [UsersModule],
        })
            .overrideProvider(getRepositoryToken(User))
            .useValue(mockRepository)
            .compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);
    });

    afterEach(async () => {
        await module.close();
    });

    it('should compile the module', () => {
        expect(module).toBeDefined();
    });

    it('should provide UsersController', () => {
        expect(controller).toBeDefined();
        expect(controller).toBeInstanceOf(UsersController);
    });

    it('should provide UsersService', () => {
        expect(service).toBeDefined();
        expect(service).toBeInstanceOf(UsersService);
    });

    it('should inject User repository into UsersService', () => {
        const repository = module.get<Repository<User>>(getRepositoryToken(User));
        expect(repository).toBeDefined();
    });

    it('should have correct dependencies', () => {
        // Verify that the controller has the service injected
        expect((controller as any).users).toBeDefined();
        expect((controller as any).users).toBeInstanceOf(UsersService);
    });

    describe('Module integration', () => {
        it('should allow controller to call service methods', async () => {
            const mockUser = {
                id: 'test-id',
                email: 'test@example.com',
                name: 'Test User',
                role: 'guest',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockRepository.findOne.mockResolvedValue(mockUser);

            // Test that the controller can successfully call service methods
            const result = await controller.findOne(1);

            expect(result).toBeDefined();
        });
    });
});
