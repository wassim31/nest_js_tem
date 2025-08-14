import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
    @ApiProperty({
        example: 1,
        description: 'Unique identifier for the product',
    })
    id: number;

    @ApiProperty({
        example: 'iPhone 14 Pro',
        description: 'Name of the product',
    })
    name: string;

    @ApiProperty({
        example: 999.99,
        description: 'Price of the product in USD',
    })
    price: number;

    @ApiProperty({
        example: 'Electronics',
        description: 'Category of the product',
    })
    category: string;

    @ApiPropertyOptional({
        example: 'Latest iPhone with Pro features and advanced camera system',
        description: 'Description of the product',
    })
    description?: string;

    @ApiPropertyOptional({
        example: '/uploads/iphone-14-pro.jpg',
        description: 'URL path to the product image',
    })
    imageUrl?: string;

    @ApiProperty({
        example: 'e7b0a7a5-8b1a-4c9e-9d5a-1a2b3c4d5e6f',
        description: 'ID of the user who owns this product',
    })
    ownerId: string;
}

export class ProductDeleteResponseDto {
    @ApiProperty({
        example: 'Product deleted',
        description: 'Confirmation message',
    })
    message: string;
}
