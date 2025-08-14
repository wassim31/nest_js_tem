import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards, 
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto, ProductDeleteResponseDto } from './dto/product-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/current-user.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { imageFileFilter, editFileName } from './utils/file-upload.util';
import { join } from 'path';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @ApiOperation({
    summary: 'Get all products',
    description: 'Retrieves all products with optional filtering by category and sorting by price',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter products by category',
    example: 'Electronics',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort products by price',
    example: 'asc',
  })
  @ApiResponse({
    status: 200,
    description: 'List of products retrieved successfully',
    type: [ProductResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('cookie-auth')
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('category') category?: string, @Query('sort') sort?: 'asc' | 'desc') {
    return this.productsService.findAll({ category, sort });
  }

  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Retrieves a specific product by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('cookie-auth')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @ApiOperation({
    summary: 'Create a new product',
    description: 'Creates a new product with optional image upload. Only users with OWNER role can create products.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product data with optional image file',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'iPhone 14 Pro',
          description: 'Product name',
        },
        price: {
          type: 'number',
          example: 999.99,
          description: 'Product price',
        },
        category: {
          type: 'string',
          example: 'Electronics',
          description: 'Product category',
        },
        description: {
          type: 'string',
          example: 'Latest iPhone with Pro features',
          description: 'Product description (optional)',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Product image file (optional, max 5MB, jpg/jpeg/png/gif)',
        },
      },
      required: ['name', 'price', 'category'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or invalid file type',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - OWNER role required',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('cookie-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: editFileName,
    }),
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  async create(
    @Body() dto: CreateProductDto, 
    @Request() req,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      dto.imageUrl = `/uploads/${file.filename}`;
    }
    return this.productsService.create(dto, req.user);
  }

  @ApiOperation({
    summary: 'Update a product',
    description: 'Updates an existing product with optional new image upload. Only users with OWNER role can update products.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID to update',
    type: 'integer',
    example: 1,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Updated product data with optional new image file',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'iPhone 14 Pro Max',
          description: 'Updated product name (optional)',
        },
        price: {
          type: 'number',
          example: 1099.99,
          description: 'Updated product price (optional)',
        },
        category: {
          type: 'string',
          example: 'Electronics',
          description: 'Updated product category (optional)',
        },
        description: {
          type: 'string',
          example: 'Updated description with new features',
          description: 'Updated product description (optional)',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'New product image file (optional, max 5MB, jpg/jpeg/png/gif)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or invalid file type',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - OWNER role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('cookie-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: editFileName,
    }),
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  async update(
    @Param('id') id: string, 
    @Body() dto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      dto.imageUrl = `/uploads/${file.filename}`;
    }
    return this.productsService.update(+id, dto);
  }

  @ApiOperation({
    summary: 'Delete a product',
    description: 'Deletes a product by ID. Only users with OWNER role can delete products.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID to delete',
    type: 'integer',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    type: ProductDeleteResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - OWNER role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiSecurity('cookie-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  @ApiOperation({
    summary: 'Get product image',
    description: 'Serves the product image file',
  })
  @ApiParam({
    name: 'filename',
    description: 'Image filename',
    example: 'iphone-14-pro-uuid.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Image file served successfully',
    content: {
      'image/jpeg': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
      'image/png': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
      'image/gif': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Image file not found',
  })
  @Get('uploads/:filename')
  getImage(@Param('filename') filename: string, @Res() res: Response) {
    const path = join(process.cwd(), 'uploads', filename);
    return res.sendFile(path);
  }
}
