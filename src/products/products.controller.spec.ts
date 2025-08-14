import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Response } from 'express';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 100,
    category: 'Electronics',
    description: 'Test description',
    imageUrl: '/uploads/test-image.jpg',
    ownerId: 'user-id',
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    destination: './uploads',
    filename: 'test-image.jpg',
    path: './uploads/test-image.jpg',
    buffer: Buffer.from('test'),
    stream: null as any,
  };

  const mockUser = {
    userId: 'user-id',
    email: 'test@example.com',
    role: 'OWNER',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockProduct]),
            findOne: jest.fn().mockResolvedValue(mockProduct),
            create: jest.fn().mockResolvedValue(mockProduct),
            update: jest.fn().mockResolvedValue(mockProduct),
            remove: jest.fn().mockResolvedValue({ message: 'Product deleted' }),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return products list', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockProduct]);
      expect(service.findAll).toHaveBeenCalledWith({ category: undefined, sort: undefined });
    });

    it('should return filtered products list', async () => {
      const result = await controller.findAll('Electronics', 'asc');
      expect(result).toEqual([mockProduct]);
      expect(service.findAll).toHaveBeenCalledWith({ category: 'Electronics', sort: 'asc' });
    });
  });

  describe('findOne', () => {
    it('should return one product', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockProduct);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    const createDto: CreateProductDto = {
      name: 'Test Product',
      price: 100,
      category: 'Electronics',
      description: 'Test description',
    };

    it('should create product without image', async () => {
      const mockRequest = { user: mockUser };
      const result = await controller.create(createDto, mockRequest);
      
      expect(result).toEqual(mockProduct);
      expect(service.create).toHaveBeenCalledWith(createDto, mockUser);
    });

    it('should create product with image', async () => {
      const mockRequest = { user: mockUser };
      const dtoWithImage = { ...createDto };
      
      const result = await controller.create(dtoWithImage, mockRequest, mockFile);
      
      expect(dtoWithImage.imageUrl).toBe('/uploads/test-image.jpg');
      expect(result).toEqual(mockProduct);
      expect(service.create).toHaveBeenCalledWith(dtoWithImage, mockUser);
    });
  });

  describe('update', () => {
    const updateDto: UpdateProductDto = {
      name: 'Updated Product',
      price: 150,
    };

    it('should update product without image', async () => {
      const result = await controller.update('1', updateDto);
      
      expect(result).toEqual(mockProduct);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should update product with image', async () => {
      const dtoWithImage = { ...updateDto };
      
      const result = await controller.update('1', dtoWithImage, mockFile);
      
      expect(dtoWithImage.imageUrl).toBe('/uploads/test-image.jpg');
      expect(result).toEqual(mockProduct);
      expect(service.update).toHaveBeenCalledWith(1, dtoWithImage);
    });
  });

  describe('remove', () => {
    it('should remove product', async () => {
      const result = await controller.remove('1');
      expect(result).toEqual({ message: 'Product deleted' });
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('getImage', () => {
    it('should serve image file', () => {
      const mockResponse = {
        sendFile: jest.fn(),
      } as unknown as Response;

      controller.getImage('test-image.jpg', mockResponse);
      
      expect(mockResponse.sendFile).toHaveBeenCalledWith(
        expect.stringContaining('uploads/test-image.jpg')
      );
    });
  });
});
