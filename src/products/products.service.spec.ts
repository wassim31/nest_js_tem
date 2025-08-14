import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: Repository<Product>;

  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 100,
    category: 'Electronics',
    description: 'Test description',
    imageUrl: '/uploads/test-image.jpg',
    ownerId: 'user-id',
  };

  const mockUser = {
    userId: 'user-id',
    email: 'test@example.com',
    role: 'OWNER',
  };

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repo = module.get<Repository<Product>>(getRepositoryToken(Product));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product without image', async () => {
      const createDto: CreateProductDto = {
        name: 'Test Product',
        price: 100,
        category: 'Electronics',
        description: 'Test description',
      };

      jest.spyOn(repo, 'create').mockReturnValue(mockProduct as any);
      jest.spyOn(repo, 'save').mockResolvedValue(mockProduct as any);

      const result = await service.create(createDto, mockUser);

      expect(repo.create).toHaveBeenCalledWith({
        ...createDto,
        ownerId: mockUser.userId,
      });
      expect(repo.save).toHaveBeenCalledWith(mockProduct);
      expect(result).toEqual(mockProduct);
    });

    it('should create a product with image', async () => {
      const createDto: CreateProductDto = {
        name: 'Test Product',
        price: 100,
        category: 'Electronics',
        description: 'Test description',
        imageUrl: '/uploads/test-image.jpg',
      };

      jest.spyOn(repo, 'create').mockReturnValue(mockProduct as any);
      jest.spyOn(repo, 'save').mockResolvedValue(mockProduct as any);

      const result = await service.create(createDto, mockUser);

      expect(repo.create).toHaveBeenCalledWith({
        ...createDto,
        ownerId: mockUser.userId,
      });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return all products without filter', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockProduct]);

      const result = await service.findAll();

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('p');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual([mockProduct]);
    });

    it('should return filtered products by category', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockProduct]);

      const result = await service.findAll({ category: 'Electronics' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('p.category = :category', { category: 'Electronics' });
      expect(result).toEqual([mockProduct]);
    });

    it('should return sorted products', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockProduct]);

      const result = await service.findAll({ sort: 'asc' });

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('p.price', 'ASC');
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findOne', () => {
    it('should return a product when found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(mockProduct as any);

      const result = await service.findOne(1);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Product',
        imageUrl: '/uploads/new-image.jpg',
      };

      const updatedProduct = { ...mockProduct, ...updateDto };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct as any);
      jest.spyOn(repo, 'save').mockResolvedValue(updatedProduct as any);

      const result = await service.update(1, updateDto);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repo.save).toHaveBeenCalledWith({ ...mockProduct, ...updateDto });
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct as any);
      jest.spyOn(repo, 'remove').mockResolvedValue(mockProduct as any);

      const result = await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repo.remove).toHaveBeenCalledWith(mockProduct);
      expect(result).toEqual({ message: 'Product deleted' });
    });
  });
});
