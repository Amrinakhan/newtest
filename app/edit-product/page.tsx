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

export default function EditProductPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
  });

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

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image_url: product.image_url,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert('Please select a product to edit');
      return;
    }

    if (!formData.name || !formData.description || !formData.price || !formData.image_url) {
      alert('Please fill in all fields');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: formData.image_url,
        }),
      });

      if (response.ok) {
        alert('Product updated successfully!');
        // Refresh products list
        await fetchProducts();
        // Reset form
        setSelectedProduct(null);
        setFormData({
          name: '',
          description: '',
          price: '',
          image_url: '',
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update product'}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    } finally {
      setSaving(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600 mt-2">Select a product and update its details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Select Product</h2>
          {products.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className={`p-4 bg-white rounded-lg shadow cursor-pointer transition-all ${
                    selectedProduct?.id === product.id
                      ? 'border-2 border-blue-500 shadow-lg'
                      : 'border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No Image</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {product.description}
                      </p>
                      <p className="text-lg font-bold text-gray-900">${product.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Edit Details</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            {!selectedProduct ? (
              <div className="text-center py-12 text-gray-500">
                <p>Select a product from the left to edit</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {formData.image_url && (
                    <div className="mt-2 w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                      saving
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {saving ? 'Updating...' : '✓ Update Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      setFormData({
                        name: '',
                        description: '',
                        price: '',
                        image_url: '',
                      });
                    }}
                    className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
