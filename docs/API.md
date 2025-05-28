# Warehouse Management API Documentation

## Overview

This document describes the REST API endpoints for the Warehouse Management System.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints require authentication using JWT tokens.

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## API Endpoints

### Products

#### Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `categoryId` (string): Filter by category ID
- `isActive` (boolean): Filter by active status
- `search` (string): Search in product name and description
- `sortBy` (string): Sort field
- `sortOrder` (string): Sort order (asc/desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "description": "Product description",
      "sku": "PROD-001",
      "categoryId": "uuid",
      "price": 99.99,
      "unit": "pcs",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z",
      "category": {
        "id": "uuid",
        "name": "Category Name"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2023-01-01T00:00:00Z"
}
```

#### Get Product by ID
```http
GET /api/products/{id}
```

#### Create Product
```http
POST /api/products
```

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "sku": "PROD-001",
  "categoryId": "uuid",
  "price": 99.99,
  "unit": "pcs",
  "isActive": true
}
```

#### Update Product
```http
PUT /api/products/{id}
```

#### Delete Product
```http
DELETE /api/products/{id}
```

#### Get Product by SKU
```http
GET /api/products/sku/{sku}
```

### Inventory

#### Get Inventory Items
```http
GET /api/inventory
```

#### Get Inventory by Product ID
```http
GET /api/inventory/product/{productId}
```

#### Update Stock
```http
PUT /api/inventory/{id}
```

**Request Body:**
```json
{
  "quantity": 100,
  "minThreshold": 10,
  "maxThreshold": 1000,
  "location": "Warehouse A"
}
```

#### Record Stock Movement
```http
POST /api/inventory/movements
```

**Request Body:**
```json
{
  "productId": "uuid",
  "type": "IN",
  "quantity": 50,
  "reason": "Purchase order",
  "reference": "PO-001",
  "performedBy": "user-id"
}
```

### Orders

#### Get All Orders
```http
GET /api/orders
```

#### Get Order by ID
```http
GET /api/orders/{id}
```

#### Create Order
```http
POST /api/orders
```

**Request Body:**
```json
{
  "customerId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "unitPrice": 99.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country"
  },
  "notes": "Special instructions"
}
```

#### Update Order Status
```http
PUT /api/orders/{id}/status
```

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

### Customers

#### Get All Customers
```http
GET /api/customers
```

#### Get Customer by ID
```http
GET /api/customers/{id}
```

#### Create Customer
```http
POST /api/customers
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country"
  }
}
```

### Reports

#### Get Sales Report
```http
GET /api/reports/sales
```

**Query Parameters:**
- `startDate` (string): Start date (ISO format)
- `endDate` (string): End date (ISO format)
- `groupBy` (string): Group by period (day/week/month)

#### Get Inventory Report
```http
GET /api/reports/inventory
```

#### Get Top Products
```http
GET /api/reports/top-products
```

### Alerts

#### Get All Alerts
```http
GET /api/alerts
```

#### Mark Alert as Read
```http
PUT /api/alerts/{id}/read
```

#### Resolve Alert
```http
PUT /api/alerts/{id}/resolve
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2023-01-01T00:00:00Z"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address.

## Pagination

All list endpoints support pagination with the following parameters:
- `page`: Page number (starting from 1)
- `limit`: Number of items per page (max 100)

## Filtering and Sorting

Most list endpoints support filtering and sorting:
- Use query parameters for filtering
- Use `sortBy` and `sortOrder` for sorting
- Use `search` for text-based searching
