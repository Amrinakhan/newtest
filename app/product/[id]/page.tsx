'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import CustomerNameModal from '@/components/EmailCollectionModal';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();

      if (Array.isArray(data)) {
        const foundProduct = data.find((p: Product) => p.id === parseInt(id));
        setProduct(foundProduct || null);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    // Show name modal to get customer name
    setShowNameModal(true);
  };

  const handleNameSubmit = async (name: string) => {
    if (!product) return;

    try {
      for (let i = 0; i < quantity; i++) {
        await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_name: product.name,
            price: product.price,
            customer_name: name,
          }),
        });
      }
      alert(`${quantity} x ${product.name} added to your orders! Thank you for your purchase.`);
      router.push('/');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  if (loading) {
    return null;
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-red-600 mb-4">Product not found</p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <CustomerNameModal
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
        onSubmit={handleNameSubmit}
        title="Complete Your Purchase"
        message="Please enter your name to complete the order"
      />

      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
      >
        <span>←</span>
        <span>Back to Home</span>
      </button>

      {/* Product Detail */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-gray-100 flex items-center justify-center p-8">
            <img
              src={product.image_url}
              alt={product.name}
              className="max-h-96 w-full object-contain rounded-lg"
            />
          </div>

          {/* Product Info */}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            <div className="mb-6">
              <p className="text-4xl font-bold text-green-600">
                ${product.price}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${(product.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
            >
              Add to Cart
            </button>

            {/* Product Details */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Product Details
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex justify-between">
                  <span className="font-medium">Product ID:</span>
                  <span>#{product.id}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Price:</span>
                  <span>${product.price}</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Availability:</span>
                  <span className="text-green-600 font-semibold">In Stock</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
