# Ecommerce Website

A simple ecommerce website built with Next.js, Node.js, and PostgreSQL.

## Features

- **Products List**: View all available products
- **Add to Cart**: Add products to shopping cart
- **Order Placement**: Place orders with customer information
- **Admin Panel**: View all orders, filter by status, and update order status
- **Database Integration**: PostgreSQL database with orders and products tables

## Setup Instructions

### 1. Database Setup

Make sure you have PostgreSQL installed and running. Create the database and tables:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database (if not already created)
CREATE DATABASE fortesting;

# Exit psql
\q

# Run the schema file
psql -U postgres -d fortesting -f sql/schema.sql
```

### 2. Environment Configuration

Update the `.env.local` file with your PostgreSQL credentials:

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=fortesting
DB_PASSWORD=your_actual_password
DB_PORT=5432
```

Also update the database configuration in `lib/db.ts` with your PostgreSQL password.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── products/route.ts      # Products API endpoints
│   │   └── orders/
│   │       ├── route.ts           # Orders API endpoints
│   │       └── [id]/route.ts      # Update order status
│   ├── admin/
│   │   └── page.tsx               # Admin panel
│   ├── layout.tsx                 # Main layout
│   ├── page.tsx                   # Products listing page
│   └── globals.css                # Global styles
├── lib/
│   └── db.ts                      # Database configuration
├── sql/
│   └── schema.sql                 # Database schema
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## Database Schema

### Orders Table
- `id` (SERIAL PRIMARY KEY)
- `product_name` (VARCHAR)
- `price` (DECIMAL)
- `customer_name` (VARCHAR)
- `status` ('pending' | 'purchased')
- `created_at` (TIMESTAMP)

### Products Table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR)
- `description` (TEXT)
- `price` (DECIMAL)
- `image_url` (VARCHAR)
- `created_at` (TIMESTAMP)

## Usage

1. **View Products**: Go to the home page to see all products
2. **Add to Cart**: Click "Add to Cart" button on any product
3. **Checkout**: Click the "Checkout" button in the cart area and enter your name
4. **Admin Panel**: Go to `/admin` to view all orders and manage their status

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/[id]` - Update order status

## Technologies Used

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with pg driver
- **Styling**: Tailwind CSS"# newtest" 
