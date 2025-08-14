import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { ProductsService } from './products/products.service';
import { UserRole } from './users/entities/user-role.enum';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const usersService = app.get(UsersService);
    const productsService = app.get(ProductsService);

    try {
        console.log('🌱 Starting database seeding...');

        // Create owner user (pre-created by developer)
        console.log('1. Creating owner user...');
        const ownerData = {
            name: 'Store Owner',
            email: 'owner@store.com',
            password: 'OwnerSecurePass123!',
            role: UserRole.OWNER
        };

        let owner;
        try {
            owner = await usersService.createSeed(ownerData);
            console.log('✓ Owner user created:', owner.email);
        } catch (error) {
            // Owner might already exist
            if (error.message?.includes('duplicate key') || error.code === '23505') {
                console.log('! Owner user already exists, fetching...');
                owner = await usersService.findByEmail('owner@store.com');
            } else {
                throw error;
            }
        }

        // Create sample products
        console.log('\n2. Creating sample products...');
        const products = [
            {
                name: 'Wireless Bluetooth Headphones',
                price: 99.99,
                category: 'Electronics',
                description: 'High-quality wireless headphones with noise cancellation'
            },
            {
                name: 'Ceramic Coffee Mug',
                price: 15.50,
                category: 'Home & Kitchen',
                description: 'Beautiful ceramic mug perfect for your morning coffee'
            },
            {
                name: 'Running Shoes',
                price: 129.99,
                category: 'Sports & Outdoors',
                description: 'Comfortable running shoes for all weather conditions'
            },
            {
                name: 'Adjustable Laptop Stand',
                price: 45.00,
                category: 'Office Supplies',
                description: 'Ergonomic laptop stand for better posture'
            },
            {
                name: 'Decorative Plant Pot',
                price: 12.99,
                category: 'Home & Garden',
                description: 'Beautiful pot for your indoor plants'
            },
            {
                name: 'USB-C Cable',
                price: 19.99,
                category: 'Electronics',
                description: 'Durable USB-C charging cable'
            },
            {
                name: 'Desk Organizer',
                price: 24.99,
                category: 'Office Supplies',
                description: 'Keep your desk tidy with this wooden organizer'
            },
            {
                name: 'Water Bottle',
                price: 22.50,
                category: 'Sports & Outdoors',
                description: 'Insulated water bottle keeps drinks cold for hours'
            }
        ];

        for (const productData of products) {
            try {
                const product = await productsService.create(productData, owner);
                console.log(`✓ Added: ${product.name} - $${product.price}`);
            } catch (error) {
                console.log(`✗ Failed to add ${productData.name}:`, error.message);
            }
        }

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`- Owner user: ${owner.email} (role: ${owner.role})`);
        console.log(`- Products created: ${products.length}`);
        console.log('\n🔑 Owner credentials:');
        console.log('Email: owner@store.com');
        console.log('Password: OwnerSecurePass123!');

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    } finally {
        await app.close();
    }
}

seed();
