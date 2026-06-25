'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
// Dynamic categories loaded via API

export default function ProductForm({ initialData = null, isEdit = false }) {
  const { token } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    img: '',
    isOnSale: false,
    isEssential: false,
    essentialCollection: '',
    originalPrice: '',
    inStock: true,
    sizes: [],
    colors: [],
    variants: [],
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [currentVariantPage, setCurrentVariantPage] = useState(1);
  const VARIANTS_PER_PAGE = 1;
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories?activeOnly=true`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
          // Auto-select first category if not set
          if (!formData.category && data.data.length > 0) {
            setFormData(prev => ({ ...prev, category: data.data[0].name }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

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
        setError(result.message || 'Image upload failed');
      }
    } catch (err) {
      console.error(err);
      setError('Error uploading image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
        const rawPrice = String(formData.price);
        if (rawPrice.includes('-')) {
          setError("Price cannot be negative.");
          setLoading(false);
          return;
        }

        if (formData.isOnSale && String(formData.originalPrice).includes('-')) {
          setError("Original price cannot be negative.");
          setLoading(false);
          return;
        }

        // derive priceValue
        const priceValue = parseFloat(rawPrice.replace(/[^0-9.]/g, ''));
        
        // Auto-flush any pending urlInputs into images
        const finalVariants = (formData.variants || []).map(v => {
          const newV = { ...v };
          if (newV.urlInput && newV.urlInput.trim() !== '') {
            newV.images = [...(newV.images || []), newV.urlInput.trim()];
            newV.urlInput = '';
          }
          return newV;
        });

        let finalStock = parseInt(formData.stock) || 0;
        if (finalVariants && finalVariants.length > 0) {
          finalStock = finalVariants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0);
        }

        let formattedPrice = rawPrice.trim();
        if (formattedPrice && !formattedPrice.includes('₹') && !formattedPrice.includes('$')) {
          formattedPrice = `₹${formattedPrice}`;
        }

        let formattedOriginalPrice = formData.originalPrice ? String(formData.originalPrice).trim() : '';
        if (formattedOriginalPrice && !formattedOriginalPrice.includes('₹') && !formattedOriginalPrice.includes('$')) {
          formattedOriginalPrice = `₹${formattedOriginalPrice}`;
        }
        
        const payload = { ...formData, variants: finalVariants, price: formattedPrice, originalPrice: formattedOriginalPrice, priceValue, stock: finalStock };

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
        setError(data.message || 'Something went wrong');
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
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-muted)]">Product Name *</label>
          <input 
            type="text" required name="name" value={formData.name || ''} onChange={handleChange}
            className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-muted)]">Price (e.g. 59.99) *</label>
            <input 
              type="text" required name="price" value={formData.price || ''} onChange={handleChange}
              className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          
          {formData.isOnSale && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-muted)]">Original Price</label>
              <input 
                type="text" name="originalPrice" value={formData.originalPrice || ''} onChange={handleChange}
                className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-muted)]">Category *</label>
          <select
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            required
            className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)] bg-white"
          >
            <option value="" disabled>Select a category</option>
            {categories.map(cat => (
              <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-muted)]">Description</label>
          <textarea 
            name="description" value={formData.description || ''} onChange={handleChange} rows="4"
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
            {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map(size => (
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


        <div className="space-y-4 pt-4 border-t border-[var(--border)]">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-[var(--text-muted)]">Product Variants (Colors & Images)</label>
            <button 
              type="button" 
              onClick={() => {
                const currentVariants = formData.variants || [];
                setFormData({...formData, variants: [...currentVariants, { colorName: '', variantName: '', images: [], stock: 0, sizes: [], sizeInventory: {} }]});
                setCurrentVariantPage(currentVariants.length + 1);
              }}
              className="text-xs bg-[var(--accent)] text-white px-3 py-1 rounded hover:bg-opacity-90"
            >
              + Add Variant
            </button>
          </div>
          
          {(() => {
            const totalVariantPages = Math.ceil((formData.variants || []).length / VARIANTS_PER_PAGE);
            const startIndex = (currentVariantPage - 1) * VARIANTS_PER_PAGE;
            const paginatedVariants = (formData.variants || []).slice(startIndex, startIndex + VARIANTS_PER_PAGE);
            
            return (
              <>
                {paginatedVariants.map((variant, localIndex) => {
                  const index = startIndex + localIndex;
                  return (
                    <div key={index} className="p-4 border border-[var(--border)] rounded-lg bg-[#fafafa] space-y-4 relative">
                      <button 
                        type="button" 
                        onClick={() => {
                          const newVariants = [...formData.variants];
                          newVariants.splice(index, 1);
                          setFormData({...formData, variants: newVariants});
                          if (paginatedVariants.length === 1 && currentVariantPage > 1) {
                            setCurrentVariantPage(currentVariantPage - 1);
                          }
                        }}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
                      >
                        ✕
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Variant Name</label>
                  <input 
                    type="text" 
                    value={variant.variantName || ''}
                    onChange={(e) => {
                      const newVariants = [...formData.variants];
                      newVariants[index].variantName = e.target.value;
                      // Keep colorName in sync for backend schema requirements and color selection logic
                      newVariants[index].colorName = e.target.value;
                      setFormData({...formData, variants: newVariants});
                    }}
                    placeholder="e.g. Baggy Shirt - Black"
                    className="w-full border border-[var(--border)] rounded px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Total Stock {variant.sizes?.length > 0 ? '(Auto)' : ''}</label>
                  <input 
                    type="number" 
                    min="0"
                    value={variant.stock}
                    readOnly={variant.sizes?.length > 0}
                    onChange={(e) => {
                      if (variant.sizes?.length > 0) return;
                      const newVariants = [...formData.variants];
                      newVariants[index].stock = parseInt(e.target.value) || 0;
                      setFormData({...formData, variants: newVariants});
                    }}
                    className={`w-full border border-[var(--border)] rounded px-3 py-1.5 text-sm ${variant.sizes?.length > 0 ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Available Sizes & Stock for this Color</label>
                <div className="flex flex-col gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map(size => {
                    const isChecked = variant.sizes?.includes(size) || false;
                    return (
                      <div key={size} className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer w-16">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={(e) => {
                              const newVariants = [...formData.variants];
                              const currentSizes = newVariants[index].sizes || [];
                              if (!newVariants[index].sizeInventory) newVariants[index].sizeInventory = {};
                              
                              if (e.target.checked) {
                                newVariants[index].sizes = [...currentSizes, size];
                                newVariants[index].sizeInventory[size] = 0;
                              } else {
                                newVariants[index].sizes = currentSizes.filter(s => s !== size);
                                delete newVariants[index].sizeInventory[size];
                              }
                              
                              // Auto sum total stock
                              newVariants[index].stock = Object.values(newVariants[index].sizeInventory || {}).reduce((a,b)=>a+b, 0);
                              setFormData({...formData, variants: newVariants});
                            }}
                            className="w-3.5 h-3.5 accent-[var(--accent)]"
                          />
                          <span className="text-xs font-medium text-[var(--foreground)]">{size}</span>
                        </label>
                        {isChecked && (
                          <input
                            type="number"
                            min="0"
                            placeholder="Stock"
                            value={variant.sizeInventory?.[size] || 0}
                            onChange={(e) => {
                               const newVariants = [...formData.variants];
                               if (!newVariants[index].sizeInventory) newVariants[index].sizeInventory = {};
                               newVariants[index].sizeInventory[size] = parseInt(e.target.value) || 0;
                               // Auto sum total stock
                               newVariants[index].stock = Object.values(newVariants[index].sizeInventory || {}).reduce((a,b)=>a+b, 0);
                               setFormData({...formData, variants: newVariants});
                            }}
                            className="border border-[var(--border)] rounded px-2 py-1 text-xs w-20"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Variant Images</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(variant.images || []).map((img, imgIndex) => (
                    <div key={imgIndex} className="relative group">
                      <img src={img} className="w-16 h-16 object-cover border border-[var(--border)] rounded" />
                      <button 
                        type="button" 
                        onClick={() => {
                          const newVariants = [...formData.variants];
                          newVariants[index].images.splice(imgIndex, 1);
                          setFormData({...formData, variants: newVariants});
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={variant.urlInput || ''}
                    onChange={(e) => {
                      const newVariants = [...formData.variants];
                      newVariants[index].urlInput = e.target.value;
                      setFormData({...formData, variants: newVariants});
                    }}
                    placeholder="https://... (Add image URL)"
                    className="flex-1 border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const url = variant.urlInput?.trim();
                        if (url) {
                          const newVariants = [...formData.variants];
                          newVariants[index].images = [...(newVariants[index].images || []), url];
                          newVariants[index].urlInput = '';
                          setFormData({...formData, variants: newVariants});
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const url = variant.urlInput?.trim();
                      if (url) {
                        const newVariants = [...formData.variants];
                        newVariants[index].images = [...(newVariants[index].images || []), url];
                        newVariants[index].urlInput = '';
                        setFormData({...formData, variants: newVariants});
                      }
                    }}
                    className="bg-[#F1ECE5] text-[var(--foreground)] px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#E5DED5] transition-colors whitespace-nowrap"
                  >
                    Add URL
                  </button>
                </div>

                {variant.urlInput && (
                  <div className="mb-3">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Preview:</p>
                    <img src={variant.urlInput} alt="Preview" className="h-32 object-contain border border-[var(--border)] rounded" />
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">OR</span>
                  <label className="bg-[#F1ECE5] text-[var(--foreground)] px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#E5DED5] transition-colors cursor-pointer inline-block">
                    {uploading ? 'Uploading...' : 'Upload Image File'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        if (!e.target.files.length) return;
                        setUploading(true);
                        const newImages = [];
                        for (let file of e.target.files) {
                          const data = new FormData();
                          data.append('image', file);
                          try {
                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload`, {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
                              body: data
                            });
                            const result = await res.json();
                            if (result.success) {
                              newImages.push(result.imageUrl || result.url);
                            }
                          } catch (err) {
                            console.error('Upload error', err);
                          }
                        }
                        const newVariants = [...formData.variants];
                        newVariants[index].images = [...(newVariants[index].images || []), ...newImages];
                        setFormData({...formData, variants: newVariants});
                        setUploading(false);
                        e.target.value = '';
                      }}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
            </div>
          );
        })}
        
        {totalVariantPages > 0 && (
          <div className="flex items-center justify-between mt-4 p-4 border border-[var(--border)] rounded-lg bg-[#fafafa]">
            <span className="text-sm text-[var(--text-muted)]">Showing page {currentVariantPage} of {totalVariantPages}</span>
            <div className="flex gap-2">
              <button 
                type="button"
                disabled={currentVariantPage === 1}
                onClick={() => setCurrentVariantPage(prev => Math.max(1, prev - 1))}
                className="px-4 py-1.5 border border-[var(--border)] rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                type="button"
                disabled={currentVariantPage === totalVariantPages}
                onClick={() => setCurrentVariantPage(prev => Math.min(totalVariantPages, prev + 1))}
                className="px-4 py-1.5 border border-[var(--border)] rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </>
    );
  })()}
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

        {/* Essential Collection Selector */}
        <div className="space-y-2 pt-2">
          <label className="block text-sm font-medium text-[var(--text-muted)]">Essential Collection</label>
          <p className="text-xs text-[var(--text-muted)] mb-1">Select which Essential Collection this product appears in on the homepage.</p>
          <select
            value={formData.essentialCollection || ''}
            onChange={(e) => {
              const val = e.target.value;
              setFormData(prev => ({
                ...prev,
                essentialCollection: val,
                isEssential: val !== ''
              }));
            }}
            className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)] bg-white"
          >
            <option value="">— None (Not in Essential Collection) —</option>
            <optgroup label="Shirts">
              <option value="BAGGY SHIRT">Baggy Shirt</option>
              <option value="REGULAR SHIRT">Regular Shirt</option>
              <option value="LINEN SHIRT">Linen Shirt</option>
              <option value="HALF SLEEVE SHIRT">Half Sleeve Shirt</option>
            </optgroup>
            <optgroup label="T-Shirts">
              <option value="T-SHIRT">T-Shirt</option>
              <option value="POLO T-SHIRT">Polo T-Shirt</option>
              <option value="FULL SLEEVE T-SHIRT">Full Sleeve T-Shirt</option>
            </optgroup>
            <optgroup label="Bottoms">
              <option value="BAGGY JEANS">Baggy Jeans</option>
              <option value="BOOT CUT JEANS">Boot Cut Jeans</option>
              <option value="REGULAR FIT JEANS">Regular Fit Jeans</option>
              <option value="STRAIGHT FIT JEANS">Straight Fit Jeans</option>
              <option value="TRACK PANT">Track Pant</option>
            </optgroup>
          </select>
          {formData.isEssential && formData.essentialCollection && (
            <p className="text-xs text-green-600 mt-1">✓ Product will appear in <strong>{formData.essentialCollection}</strong> collection.</p>
          )}
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
