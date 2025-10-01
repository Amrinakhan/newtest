-- Connect to the fortesting database first
-- \c fortesting;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'purchased')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table for demo products
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some demo products
INSERT INTO products (name, description, price, image_url) VALUES
('Laptop', 'High-performance laptop for work and gaming', 999.99, 'https://via.placeholder.com/300x200?text=Laptop'),
('Smartphone', 'Latest smartphone with advanced features', 699.99, 'https://via.placeholder.com/300x200?text=Smartphone'),
('Headphones', 'Wireless noise-cancelling headphones', 199.99, 'https://via.placeholder.com/300x200?text=Headphones'),
('Tablet', 'Portable tablet for reading and entertainment', 299.99, 'https://via.placeholder.com/300x200?text=Tablet'),
('Smartwatch', 'Fitness tracker and smartwatch', 249.99, 'https://via.placeholder.com/300x200?text=Smartwatch'),
('Camera', 'Digital camera for photography', 599.99, 'https://via.placeholder.com/300x200?text=Camera')
ON CONFLICT DO NOTHING;