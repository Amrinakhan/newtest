'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();

      // Check if data is an array, if not use fallback data
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        // Fallback products data if database is not set up
        setProducts([
          { id: 1, name: 'Gaming Laptop', description: 'High-performance laptop for work and gaming', price: 999.99, image_url: '/images/laptop.png' },
          { id: 2, name: 'Wireless Headphones', description: 'Premium noise-cancelling headphones', price: 199.99, image_url: '/images/headphone.jpg' },
          { id: 3, name: 'iPad Tablet', description: 'Portable tablet for reading and entertainment', price: 299.99, image_url: '/images/tablet.jpg' },
          { id: 4, name: 'Smart Watch', description: 'Fitness tracker and smartwatch', price: 249.99, image_url: '/images/smartwatch.jpg' },
          { id: 5, name: 'Digital Camera', description: 'Professional camera for photography', price: 599.99, image_url: '/images/camera.jpg' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Set fallback products on error
      setProducts([
        { id: 1, name: 'Gaming Laptop', description: 'High-performance laptop for work and gaming', price: 999.99, image_url: '/images/laptop.png' },
        { id: 2, name: 'Wireless Headphones', description: 'Premium noise-cancelling headphones', price: 199.99, image_url: '/images/headphone.jpg' },
        { id: 3, name: 'iPad Tablet', description: 'Portable tablet for reading and entertainment', price: 299.99, image_url: '/images/tablet.jpg' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));
    alert(`${product.name} added to cart!`);
  };

  const proceedToCheckout = () => {
    const cartItems = Object.entries(cart).map(([productId, quantity]) => {
      const product = products.find(p => p.id === parseInt(productId));
      return { product, quantity };
    }).filter(item => item.product && item.quantity > 0);

    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const customerName = prompt('Please enter your name:');
    if (!customerName) return;

    // Place orders for each item in cart
    cartItems.forEach(async ({ product, quantity }) => {
      if (product) {
        for (let i = 0; i < quantity; i++) {
          try {
            await fetch('/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                product_name: product.name,
                price: product.price,
                customer_name: customerName,
              }),
            });
          } catch (error) {
            console.error('Error placing order:', error);
          }
        }
      }
    });

    setCart({});
    alert('Orders placed successfully!');
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === parseInt(productId));
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Products</h1>
          <a
            href="/add-product"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Add Product
          </a>
        </div>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          <span>Cart: {getTotalItems()} items (${getTotalPrice().toFixed(2)})</span>
          {getTotalItems() > 0 && (
            <button
              onClick={proceedToCheckout}
              className="ml-4 bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm"
            >
              Checkout
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-3">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-green-600">
                  ${product.price}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Add to Cart
                  {cart[product.id] && (
                    <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                      {cart[product.id]}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}