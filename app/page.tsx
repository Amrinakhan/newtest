'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import AuthModal from '@/components/AuthModal';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'main' | 'join' | 'signin'>('main');

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
    // Check if user is logged in
    if (!session) {
      alert('Please login to add items to cart!');
      setAuthView('join');
      setShowAuthModal(true);
      return;
    }

    setCart(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));
    alert(`${product.name} added to cart!`);
  };

  const proceedToCheckout = () => {
    // Check if user is logged in
    if (!session) {
      alert('Please login to checkout!');
      setAuthView('signin');
      setShowAuthModal(true);
      return;
    }

    const cartItems = Object.entries(cart).map(([productId, quantity]) => {
      const product = products.find(p => p.id === parseInt(productId));
      return { product, quantity };
    }).filter(item => item.product && item.quantity > 0);

    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const customerName = session.user?.name || session.user?.email || 'Guest';

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
    alert('Orders placed successfully! Thank you for your purchase.');
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
    <div className="min-h-screen bg-gray-50">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => { setShowAuthModal(false); setAuthView('main'); }}
        initialView={authView}
      />

      {/* Clean Professional Header - DealGuru Style */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
              </svg>
              <span className="text-xl font-bold text-gray-900">DealHub</span>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {session ? (
                <>
                  <span className="text-sm text-gray-600 hidden md:block">
                    {session.user?.name || session.user?.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setAuthView('join'); setShowAuthModal(true); }}
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-medium transition-colors"
                  >
                    Join for free
                  </button>
                  <button
                    onClick={() => { setAuthView('signin'); setShowAuthModal(true); }}
                    className="text-sm text-gray-700 hover:text-gray-900 px-4 py-2 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    Log on
                  </button>
                </>
              )}

              {/* Cart */}
              <div className="relative ml-2">
                <button className="relative p-2 text-gray-700 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Summary Banner */}
      {getTotalItems() > 0 && (
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="text-sm">
                <span className="font-semibold text-gray-900">{getTotalItems()} items</span>
                <span className="text-gray-600"> in your cart - </span>
                <span className="font-semibold text-gray-900">${getTotalPrice().toFixed(2)}</span>
              </div>
              <button
                onClick={proceedToCheckout}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-medium transition-colors"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clean Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get access to the best deals!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Join for free or log in to get exclusive offers
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{products.length}+</div>
              <div className="text-gray-600">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">Free</div>
              <div className="text-gray-600">Shipping</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Deals</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map((product) => (
          <div key={product.id} className="group bg-white rounded-lg border border-gray-200 hover:border-blue-300 overflow-hidden hover:shadow-lg transition-all duration-200">
            <Link href={`/product/${product.id}`} className="block">
              <div className="relative bg-gray-50 aspect-square overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-semibold">
                  Deal
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ${(product.price * 1.3).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex text-yellow-400 text-sm">
                    {'★'.repeat(5)}
                  </div>
                  <span className="text-xs text-gray-500">(4.5)</span>
                </div>
              </div>
            </Link>
            <div className="px-4 pb-4">
              <button
                onClick={() => addToCart(product)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded font-medium transition-colors text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add to Cart
                {cart[product.id] && (
                  <span className="bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-bold">
                    {cart[product.id]}
                  </span>
                )}
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Simple Clean Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">About</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">About Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact</a></li>
                <li><a href="/admin" className="text-gray-600 hover:text-gray-900">Admin</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Help</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">FAQ</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Shipping</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Returns</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Terms</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Cookies</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Follow Us</h4>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                  <span className="text-sm">f</span>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                  <span className="text-sm">tw</span>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                  <span className="text-sm">in</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 text-center">
            <p className="text-sm text-gray-500">© 2025 DealHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}