'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProductForm({ initialData = null, isEdit = false }) {
  const { token } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'clothing',
    img: '',
    isOnSale: false,
    originalPrice: '',
    inStock: true,
    sizes: [],
  });
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        },
        body: data
      });
      const result = await res.json();
      if (result.success) {
        setFormData(prev => ({ ...prev, img: result.imageUrl || result.url || '' }));
      } else {
        alert(result.message || 'Image upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // derive priceValue
      const priceValue = parseFloat(formData.price.replace(/[^0-9.]/g, ''));
      const payload = { ...formData, priceValue };

      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products${isEdit ? `/${initialData._id}` : ''}`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        router.refresh(); // purge next.js cache
        router.push('/admin/products');
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--border)] max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-muted)]">Product Name *</label>
            <input 
              type="text" required name="name" value={formData.name} onChange={handleChange}
              className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-muted)]">Category *</label>
            <select 
              name="category" value={formData.category} onChange={handleChange} required
              className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)] bg-white"
            >
              <option value="clothing">Clothing</option>
              <option value="shoes">Shoes</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-muted)]">Price (e.g. 59.99) *</label>
            <input 
              type="text" required name="price" value={formData.price} onChange={handleChange}
              className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          
          {formData.isOnSale && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-muted)]">Original Price</label>
              <input 
                type="text" name="originalPrice" value={formData.originalPrice} onChange={handleChange}
                className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-muted)]">Description</label>
          <textarea 
            name="description" value={formData.description} onChange={handleChange} rows="4"
            className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-muted)]">Image URL *</label>
          <div className="flex gap-2">
            <input 
              type="text" required name="img" value={formData.img || ''} onChange={handleChange} placeholder="https://..."
              className="flex-1 border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
            />
            <input 
              type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              className="bg-[#F1ECE5] text-[var(--foreground)] px-4 py-2 rounded-lg font-medium hover:bg-[#E5DED5] transition-colors whitespace-nowrap"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
          {formData.img && (
            <div className="mt-2">
              <img src={formData.img} alt="Preview" className="h-32 object-contain border border-[var(--border)] rounded" />
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <label className="block text-sm font-medium text-[var(--text-muted)]">Available Sizes</label>
          <div className="flex flex-wrap gap-4">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(size => (
              <label key={size} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.sizes?.includes(size) || false}
                  onChange={(e) => {
                    const currentSizes = formData.sizes || [];
                    if (e.target.checked) {
                      setFormData({...formData, sizes: [...currentSizes, size]});
                    } else {
                      setFormData({...formData, sizes: currentSizes.filter(s => s !== size)});
                    }
                  }}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                <span className="text-sm font-medium text-[var(--foreground)]">{size}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-4 border-t border-[var(--border)]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" name="isOnSale" checked={formData.isOnSale} onChange={handleChange}
              className="w-4 h-4 accent-[var(--accent)]"
            />
            <span className="text-[var(--foreground)] font-medium">On Sale</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" name="inStock" checked={formData.inStock} onChange={handleChange}
              className="w-4 h-4 accent-[var(--accent)]"
            />
            <span className="text-[var(--foreground)] font-medium">In Stock</span>
          </label>
        </div>

        <div className="pt-6 border-t border-[var(--border)] flex justify-end gap-4">
          <button 
            type="button" onClick={() => router.back()}
            className="px-6 py-2 rounded-lg font-medium text-[var(--text-muted)] hover:bg-[#F9F7F4] transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" disabled={loading}
            className="bg-[var(--accent)] text-white px-8 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
