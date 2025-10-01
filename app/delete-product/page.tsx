'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export default function DeleteProductPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: number, productName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${productName}"?`);

    if (!confirmed) return;

    setDeleting(productId);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Product deleted successfully!');
        // Remove the deleted product from state
        setProducts(products.filter(p => p.id !== productId));
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete product'}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-xl">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin')}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Admin Panel
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Delete Product</h1>
        <p className="text-gray-600 mt-2">Select a product to delete from your store</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-4">
                  ${product.price}
                </p>
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  disabled={deleting === product.id}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                    deleting === product.id
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {deleting === product.id ? 'Deleting...' : '🗑️ Delete Product'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
