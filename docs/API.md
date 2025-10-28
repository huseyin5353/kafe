# 📡 API Dokümantasyonu

Base URL: `http://localhost:3001/api`

## Authentication

Tüm korumalı endpoint'ler için Authorization header gereklidir:

```
Authorization: Bearer <JWT_TOKEN>
```

## 🔐 Auth Endpoints

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "role": "CUSTOMER"
}
```

**Response**:
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

## 🏢 Tenant Endpoints

### Create Tenant
```http
POST /api/tenants
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Coffee Shop",
  "slug": "my-coffee-shop",
  "domain": "mycoffee.example.com"
}
```

### Get All Tenants
```http
GET /api/tenants?page=1&limit=10
Authorization: Bearer <token>
```

### Get Tenant by ID
```http
GET /api/tenants/:id
Authorization: Bearer <token>
```

### Update Tenant
```http
PATCH /api/tenants/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Coffee Shop",
  "settings": {
    "currency": "TRY",
    "timezone": "Europe/Istanbul"
  }
}
```

## 📦 Product Endpoints

### Get All Products
```http
GET /api/products?tenantId=<tenant_id>&categoryId=<category_id>&page=1&limit=20
Authorization: Bearer <token>
```

**Query Parameters**:
- `tenantId` (required): Tenant ID
- `categoryId` (optional): Filter by category
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term

### Get Product by ID
```http
GET /api/products/:id
Authorization: Bearer <token>
```

### Create Product
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Cappuccino",
  "description": "Classic Italian coffee",
  "price": 35.00,
  "cost": 15.00,
  "categoryId": "category_id",
  "tenantId": "tenant_id",
  "stock": 100,
  "image": "https://..."
}
```

### Update Product
```http
PATCH /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 40.00,
  "stock": 150
}
```

### Delete Product
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

## 🗂️ Category Endpoints

### Get All Categories
```http
GET /api/categories?tenantId=<tenant_id>
Authorization: Bearer <token>
```

### Create Category
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Hot Drinks",
  "description": "Hot beverages",
  "icon": "☕",
  "tenantId": "tenant_id",
  "sortOrder": 1
}
```

## 🛒 Order Endpoints

### Get All Orders
```http
GET /api/orders?tenantId=<tenant_id>&status=<status>&page=1&limit=20
Authorization: Bearer <token>
```

**Query Parameters**:
- `tenantId` (required): Tenant ID
- `status` (optional): PENDING, PREPARING, READY, SERVED, COMPLETED, CANCELLED
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get Order by ID
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "tenantId": "tenant_id",
  "userId": "user_id",
  "tableId": "table_id",
  "type": "DINE_IN",
  "items": [
    {
      "productId": "product_id",
      "quantity": 2,
      "price": 35.00
    }
  ],
  "subtotal": 70.00,
  "tax": 6.30,
  "discount": 0,
  "total": 76.30,
  "notes": "No sugar please"
}
```

### Update Order Status
```http
PATCH /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "PREPARING"
}
```

### Cancel Order
```http
DELETE /api/orders/:id
Authorization: Bearer <token>
```

## 🪑 Table Endpoints

### Get All Tables
```http
GET /api/tables?tenantId=<tenant_id>
Authorization: Bearer <token>
```

### Create Table
```http
POST /api/tables
Authorization: Bearer <token>
Content-Type: application/json

{
  "number": "T-01",
  "capacity": 4,
  "tenantId": "tenant_id"
}
```

### Update Table Status
```http
PATCH /api/tables/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "isOccupied": true
}
```

## 📊 Analytics Endpoints (Future)

### Get Dashboard Stats
```http
GET /api/analytics/dashboard?tenantId=<tenant_id>&from=<date>&to=<date>
Authorization: Bearer <token>
```

### Get Sales Report
```http
GET /api/analytics/sales?tenantId=<tenant_id>&period=<daily|weekly|monthly>
Authorization: Bearer <token>
```

## 🔌 WebSocket Events

Connect to: `ws://localhost:3001`

### Client → Server

#### Join Tenant Room
```javascript
socket.emit('joinTenant', tenantId);
```

### Server → Client

#### New Order
```javascript
socket.on('newOrder', (order) => {
  console.log('New order received:', order);
});
```

#### Order Update
```javascript
socket.on('orderUpdate', (order) => {
  console.log('Order updated:', order);
});
```

#### Order Status Change
```javascript
socket.on('orderStatusChange', ({ orderId, status }) => {
  console.log(`Order ${orderId} status changed to ${status}`);
});
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Rate Limiting

- **Rate**: 100 requests per 15 minutes per IP
- **Header**: `X-RateLimit-Remaining`

## Pagination

All list endpoints support pagination:

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 10, max: 100)

**Response**:
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

## Filtering & Sorting

### Filtering
```http
GET /api/products?categoryId=<id>&isActive=true&minPrice=10&maxPrice=100
```

### Sorting
```http
GET /api/products?sortBy=price&sortOrder=asc
```

## Search

```http
GET /api/products?search=coffee
```

Full-text search on:
- Product name
- Product description
- Category name

