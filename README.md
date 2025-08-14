<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->


- **User Authentication & Authorization**
  - JWT-based authentication with HTTP-only cookies
  - Role-based access control (GUEST, OWNER)
  - Secure password validation and hashing

- **Product Management**
  - CRUD operations for products
  - Image upload and storage functionality
  - Category filtering and price sorting
  - Owner-based product access control

- **File Upload System**
  - Image upload with validation (jpg, jpeg, png, gif)
  - Automatic file naming with UUID
  - 5MB file size limit
  - Secure file serving

- **API Documentation**
  - Complete Swagger/OpenAPI documentation
  - Interactive API testing interface
  - Comprehensive request/response examples


##  Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

##  Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nest_js_tem
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_username
   DB_PASS=your_password
   DB_NAME=your_database_name

   # JWT
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES=1h

   # Server
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=*
   ```

4. **Database Setup**
     ``` sudo docker-compose up -d   ```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

Once the application is running, access the interactive Swagger documentation at:

**http://localhost:3000/api**

This provides:
- Complete API endpoint documentation
- Request/response schemas
- Interactive testing interface
- Authentication examples

## Authentication

The API uses JWT tokens stored in HTTP-only cookies for security.

### Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "StrongPass123!",
    "role": "OWNER"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "StrongPass123!"
  }' \
  -c cookies.txt
```

The JWT token will be automatically stored in an HTTP-only cookie.

##  Product Management

### Get all products
```bash
curl -X GET http://localhost:3000/products \
  -b cookies.txt
```

### Filter products by category
```bash
curl -X GET "http://localhost:3000/products?category=Electronics&sort=asc" \
  -b cookies.txt
```

### Create a product with image
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: multipart/form-data" \
  -F "name=iPhone 14" \
  -F "price=999.99" \
  -F "category=Electronics" \
  -F "description=Latest iPhone model" \
  -F "image=@path/to/your/image.jpg" \
  -b cookies.txt
```

### Update a product
```bash
curl -X PATCH http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product Name",
    "price": 1299.99
  }' \
  -b cookies.txt
```

### Delete a product
```bash
curl -X DELETE http://localhost:3000/products/1 \
  -b cookies.txt
```

## 👥 User Management

### Get user by ID
```bash
curl -X GET http://localhost:3000/users/1
```

### Update user
```bash
curl -X PATCH http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "email": "newemail@example.com"
  }'
```


### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run e2e tests
```bash
npm run test:e2e
```

## API Endpoints Summary

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Users
- `POST /users` - Create user (alternative to register)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Products
- `GET /products` - Get all products (with optional filtering)
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product (with optional image upload)
- `PATCH /products/:id` - Update product (with optional image upload)
- `DELETE /products/:id` - Delete product
- `GET /products/uploads/:filename` - Serve uploaded images

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
JWT_SECRET=your_production_jwt_secret
DB_HOST=your_production_db_host
# ... other production configs
```
