const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function addProducts() {
    try {
        // Step 1: Register an owner user
        console.log('1. Creating owner user...');
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Product Owner',
            email: 'owner@example.com',
            password: 'OwnerPass123!'
        });
        console.log('✓ Owner user created:', registerResponse.data.email);

        // Step 2: Update user role to OWNER (we'll need to do this manually or via database)
        // For now, let's login and see if we can create products
        console.log('\n2. Logging in as owner...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'owner@example.com',
            password: 'OwnerPass123!'
        });
        const token = loginResponse.data.access_token;
        console.log('✓ Login successful, token received');

        // Step 3: Add sample products
        console.log('\n3. Adding sample products...');
        const products = [
            {
                name: 'Wireless Headphones',
                price: 99.99,
                category: 'Electronics'
            },
            {
                name: 'Coffee Mug',
                price: 15.50,
                category: 'Home'
            },
            {
                name: 'Running Shoes',
                price: 129.99,
                category: 'Sports'
            },
            {
                name: 'Laptop Stand',
                price: 45.00,
                category: 'Office'
            },
            {
                name: 'Plant Pot',
                price: 12.99,
                category: 'Home'
            }
        ];

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        for (const product of products) {
            try {
                const response = await axios.post(`${BASE_URL}/products`, product, { headers });
                console.log(`✓ Added: ${product.name} - $${product.price}`);
            } catch (error) {
                console.log(`✗ Failed to add ${product.name}:`, error.response?.data?.message || error.message);
            }
        }

        // Step 4: List all products
        console.log('\n4. Listing all products...');
        const allProducts = await axios.get(`${BASE_URL}/products`);
        console.log('Products in database:', allProducts.data);

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

addProducts();
