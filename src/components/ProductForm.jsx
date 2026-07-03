'use client';

import { useState, useRef, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useRouter } from 'next/navigation';
import SearchableDropdown from './SearchableDropdown';

export default function ProductForm({ initialData = null, isEdit = false }) {
  const { token } = useAdminAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    subCategory: '',
    essentialCollection: '',
    img: '',
    isOnSale: false,
    originalPrice: '',
    inStock: true,
    sku: '',
    stock: 0,
    lowStockThreshold: 5,
    sizes: [],
    variants: [],
    fit: '',
    fabric: '',
    occasion: [],
    gender: 'unisex',
    season: [],
    aiTags: [],
    brand: '',
    pattern: '',
    material: '',
    neck: '',
    sleeve: '',
    stretch: '',
    weight: '',
    colorFamily: '',
  });
  
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  // Section state
  const [activeSection, setActiveSection] = useState('basic');
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    organization: true,
    inventory: true,
    variants: true,
    ai: false, // Collapsed by default
    filters: false // Collapsed by default
  });
  
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);

  const [isDirty, setIsDirty] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [catRes, settingsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories?activeOnly=true`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`)
        ]);
        const catData = await catRes.json();
        const settingsData = await settingsRes.json();
        
        if (catData.success) {
          setCategories(catData.data);
          if (!formData.category && catData.data.length > 0) {
            setFormData(prev => ({ ...prev, category: catData.data[0].name }));
          }
        }
        if (settingsData.success && settingsData.data?.categories) {
          setCollections(settingsData.data.categories);
        }
      } catch (err) {
        console.error('Failed to fetch dropdown data:', err);
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    setIsDirty(true);
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      setError('Image must be under 800KB. Please compress your image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

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
    setSubmitAttempted(true);
    
    const missing = requiredFields.filter(f => !formData[f.key] || String(formData[f.key]).trim() === '');
    if (missing.length > 0) {
      const missingLabels = missing.map(f => f.label).join(', ');
      setError(`Please fill all required fields: ${missingLabels}`);
      setExpandedSections({
        basic: true,
        organization: true,
        inventory: true,
        variants: true,
        ai: true,
        filters: true
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return; // Do not submit if required fields are missing
    }

    setError('');
    setLoading(true);
    try {
      const rawPrice = String(formData.price);
      const priceValue = parseFloat(rawPrice.replace(/[^0-9.]/g, ''));
      
      let mainStock = parseInt(formData.stock) || 0;
      let variantStock = 0;
      if (formData.variants && formData.variants.length > 0) {
        variantStock = formData.variants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0);
      }
      let finalStock = mainStock + variantStock;

      let formattedPrice = rawPrice.trim();
      if (formattedPrice && !formattedPrice.includes('₹') && !formattedPrice.includes('$')) {
        formattedPrice = `₹${formattedPrice}`;
      }
      
      const payload = { 
        ...formData, 
        price: formattedPrice, 
        priceValue, 
        stock: finalStock,
        isEssential: !!formData.essentialCollection
      };

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
        setToastMessage(isEdit ? 'Product updated successfully.' : 'Product created successfully.');
        setTimeout(() => {
          router.push('/admin/products');
          router.refresh();
        }, 1500);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubcategory = async (categoryName) => {
    const subName = prompt('Enter new sub-category name:');
    if (!subName) return;
    const cat = categories.find(c => c.name === categoryName);
    if (!cat) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories/${cat._id}/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: subName, slug: subName.toLowerCase().replace(/\s+/g, '-') })
      });
      const data = await res.json();
      if (data.success) {
        setCategories(categories.map(c => c._id === cat._id ? data.data : c));
        setFormData(prev => ({ ...prev, subCategory: subName }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCollection = () => {
    alert('Please manage Essential Collections from the CMS Page to properly set up their homepage images.');
    router.push('/admin/cms');
  };

  // ---------------------------------------------------------
  // RENDER SECTIONS
  // ---------------------------------------------------------
  const renderBasicInfo = () => (
    <div className="space-y-4 p-4 border border-[var(--border)] rounded-lg bg-white shadow-sm mb-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('basic')}>
        <h3 className="font-semibold text-lg text-[var(--foreground)]">Basic Information</h3>
        <span>{expandedSections.basic ? '▲' : '▼'}</span>
      </div>
      
      {expandedSections.basic && (
        <div className="space-y-4 pt-4 border-t border-[var(--border)]">
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Product Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className={`w-full border ${(submitAttempted && !formData.name) ? 'border-red-300' : 'border-[var(--border)]'} rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]`} />
            {(submitAttempted && !formData.name) && <p className="text-xs text-red-500 mt-1">Product name is required</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Price *</label>
              <input type="text" name="price" value={formData.price} onChange={handleChange} required className={`w-full border ${(submitAttempted && !formData.price) ? 'border-red-300' : 'border-[var(--border)]'} rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]`} />
              {(submitAttempted && !formData.price) && <p className="text-xs text-red-500 mt-1">Price is required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Original Price (If on sale)</label>
              <input type="text" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]" />
            </div>

            <div className="flex items-center gap-4 mt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isOnSale" checked={formData.isOnSale} onChange={handleChange} className="w-4 h-4 accent-[var(--accent)]" />
                <span className="text-sm font-medium text-[var(--foreground)]">On Sale</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="inStock" checked={formData.inStock} onChange={handleChange} className="w-4 h-4 accent-[var(--accent)]" />
                <span className="text-sm font-medium text-[var(--foreground)]">Visible (Published)</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Main Image URL *</label>
            <div className="flex gap-2">
              <input type="text" name="img" value={formData.img} onChange={handleChange} required className={`flex-1 border ${(submitAttempted && !formData.img) ? 'border-red-300' : 'border-[var(--border)]'} rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]`} />
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading} className="bg-[#F1ECE5] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#E5DED5]">
                {uploading ? '...' : 'Upload'}
              </button>
            </div>
            {(submitAttempted && !formData.img) && <p className="text-xs text-red-500 mt-1">Main image is required</p>}
            {formData.img && <img src={formData.img} className="mt-2 h-24 object-contain border rounded-md" />}
          </div>
        </div>
      )}
    </div>
  );

  const renderOrganization = () => {
    const activeCategoryObj = categories.find(c => c.name === formData.category);
    const subCategoryOptions = activeCategoryObj?.subCategories?.map(sub => ({ label: sub.name, value: sub.name })) || [];
    
    return (
    <div className="space-y-4 p-4 border border-[var(--border)] rounded-lg bg-white shadow-sm mb-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('organization')}>
        <h3 className="font-semibold text-lg text-[var(--foreground)]">Organization</h3>
        <span>{expandedSections.organization ? '▲' : '▼'}</span>
      </div>
      
      {expandedSections.organization && (
        <div className="space-y-6 pt-4 border-t border-[var(--border)] pb-2">
          
          <div className="border-b border-gray-100 pb-4">
            <SearchableDropdown 
              label="Essential Collection"
              required={true}
              placeholder="Search Collection ▼"
              value={formData.essentialCollection}
              options={collections.map(c => ({ label: c.name, value: c.name }))}
              onChange={(val) => setFormData(prev => ({...prev, essentialCollection: val}))}
              onCreate={handleCreateCollection}
            />
            {(submitAttempted && !formData.essentialCollection) && <p className="text-xs text-red-500 mt-1">Essential collection is required</p>}
            <p className="text-xs text-gray-500 mt-1">This determines which collection the product appears under in the Shop page filter sidebar.</p>
          </div>

          <div className="border-b border-gray-100 pb-4">
            <SearchableDropdown 
              label="Main Category"
              required={true}
              placeholder="Search Category ▼"
              value={formData.category}
              options={categories.map(c => ({ label: c.name, value: c.name }))}
              onChange={(val) => setFormData(prev => ({...prev, category: val, subCategory: ''}))}
              onCreate={async () => {
                const name = prompt('Enter new main category name:');
                if (!name) return;
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ name, slug: name.toLowerCase().replace(/\s+/g, '-') })
                  });
                  const data = await res.json();
                  if (data.success) {
                    setCategories([...categories, data.data]);
                    setFormData(prev => ({...prev, category: name, subCategory: ''}));
                  } else {
                    alert(data.message || 'Error creating category');
                  }
                } catch(e) { console.error(e); }
              }}
            />
            {(submitAttempted && !formData.category) && <p className="text-xs text-red-500 mt-1">Main category is required</p>}
            <p className="text-xs text-gray-500 mt-1">Defines what type of product this is (e.g. Jeans, Shirt).</p>
          </div>

        </div>
      )}
    </div>
    );
  };



  const renderMainSizes = () => (
    <div className="space-y-4 p-4 border border-[var(--border)] rounded-lg bg-white shadow-sm mb-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('inventory')}>
        <h3 className="font-semibold text-lg text-[var(--foreground)]">Main Product Sizes & Stock</h3>
        <span>{expandedSections.inventory ? '▲' : '▼'}</span>
      </div>
      
      {expandedSections.inventory && (
        <div className="pt-4 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)] mb-4">Select the sizes and enter the stock available for the default/main product image.</p>
          
          <div className="flex flex-col gap-4 bg-white p-4 border border-[var(--border)] rounded-md">
            {/* Alphabetical Sizes */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Top Sizes</h4>
              <div className="flex flex-wrap gap-4">
                {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map(size => {
                  const isChecked = formData.sizes?.includes(size);
                  return (
                    <div key={size} className="flex flex-col items-start gap-1 w-20">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={isChecked || false} onChange={(e) => {
                          const newSizes = e.target.checked 
                            ? [...(formData.sizes || []), size]
                            : (formData.sizes || []).filter(s => s !== size);
                          
                          const newInventory = { ...(formData.inventory || {}) };
                          if (e.target.checked) newInventory[size] = 0;
                          else delete newInventory[size];
                          
                          const newStock = Object.values(newInventory).reduce((a,b)=>a+b, 0);
                          setFormData({...formData, sizes: newSizes, inventory: newInventory, stock: newStock});
                        }} className="accent-[var(--accent)]" />
                        <span className="text-xs font-medium">{size}</span>
                      </label>
                      {isChecked && (
                        <input type="number" min="0" value={formData.inventory?.[size] || 0} onChange={(e) => {
                          const newInventory = { ...(formData.inventory || {}) };
                          newInventory[size] = parseInt(e.target.value) || 0;
                          const newStock = Object.values(newInventory).reduce((a,b)=>a+b, 0);
                          setFormData({...formData, inventory: newInventory, stock: newStock});
                        }} className="w-full border border-[var(--border)] rounded px-2 py-1 text-xs" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full"></div>

            {/* Numerical Sizes */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Bottom Sizes</h4>
              <div className="flex flex-wrap gap-4">
                {['28', '30', '32', '34', '36', '38', '40', '42'].map(size => {
                  const isChecked = formData.sizes?.includes(size);
                  return (
                    <div key={size} className="flex flex-col items-start gap-1 w-20">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={isChecked || false} onChange={(e) => {
                          const newSizes = e.target.checked 
                            ? [...(formData.sizes || []), size]
                            : (formData.sizes || []).filter(s => s !== size);
                          
                          const newInventory = { ...(formData.inventory || {}) };
                          if (e.target.checked) newInventory[size] = 0;
                          else delete newInventory[size];
                          
                          const newStock = Object.values(newInventory).reduce((a,b)=>a+b, 0);
                          setFormData({...formData, sizes: newSizes, inventory: newInventory, stock: newStock});
                        }} className="accent-[var(--accent)]" />
                        <span className="text-xs font-medium">{size}</span>
                      </label>
                      {isChecked && (
                        <input type="number" min="0" value={formData.inventory?.[size] || 0} onChange={(e) => {
                          const newInventory = { ...(formData.inventory || {}) };
                          newInventory[size] = parseInt(e.target.value) || 0;
                          const newStock = Object.values(newInventory).reduce((a,b)=>a+b, 0);
                          setFormData({...formData, inventory: newInventory, stock: newStock});
                        }} className="w-full border border-[var(--border)] rounded px-2 py-1 text-xs" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
          
        </div>
      )}
    </div>
  );

  const renderVariants = () => (
    <div className="space-y-4 p-4 border border-[var(--border)] rounded-lg bg-white shadow-sm mb-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('variants')}>
        <h3 className="font-semibold text-lg text-[var(--foreground)]">Variants</h3>
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFormData(prev => ({
                ...prev,
                variants: [...(prev.variants || []), { colorName: '', variantName: '', images: [], stock: 0, sizes: [], sizeInventory: {} }]
              }));
              setCurrentVariantIndex((formData.variants || []).length);
              if (!expandedSections.variants) toggleSection('variants');
            }}
            className="text-xs bg-[var(--foreground)] text-white px-3 py-1 rounded hover:bg-opacity-90"
          >
            + Add Variant
          </button>
          <span>{expandedSections.variants ? '▲' : '▼'}</span>
        </div>
      </div>
      
      {expandedSections.variants && (
        <div className="space-y-4 pt-4 border-t border-[var(--border)]">
          {(!formData.variants || formData.variants.length === 0) && (
            <p className="text-sm text-[var(--text-muted)] italic">No variants added. Product will be treated as a single item.</p>
          )}
          
          {formData.variants && formData.variants.length > 0 && (
            <>
              {/* Pagination UI */}
              <div className="flex items-center justify-between bg-[#F8F8F8] px-4 py-3 rounded-lg border border-[var(--border)] mb-4">
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  Variant {currentVariantIndex + 1} of {formData.variants.length}
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={(e) => { e.preventDefault(); setCurrentVariantIndex(Math.max(0, currentVariantIndex - 1)); }}
                    disabled={currentVariantIndex === 0}
                    className="px-4 py-1.5 text-sm font-medium bg-white border border-[var(--border)] rounded hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    Previous
                  </button>
                  <button 
                    type="button" 
                    onClick={(e) => { e.preventDefault(); setCurrentVariantIndex(Math.min(formData.variants.length - 1, currentVariantIndex + 1)); }}
                    disabled={currentVariantIndex === formData.variants.length - 1}
                    className="px-4 py-1.5 text-sm font-medium bg-white border border-[var(--border)] rounded hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>

              {(() => {
                const index = currentVariantIndex;
                const variant = formData.variants[index];
                if (!variant) return null;
                
                return (
                  <div key={index} className="p-4 border border-[var(--border)] rounded-lg bg-[#fafafa] relative">
                    <button type="button" onClick={() => {
                      if (!window.confirm('Delete this variant?')) return;
                      const newV = [...formData.variants];
                      newV.splice(index, 1);
                      setFormData({...formData, variants: newV});
                      if (currentVariantIndex >= newV.length && newV.length > 0) {
                        setCurrentVariantIndex(newV.length - 1);
                      } else if (newV.length === 0) {
                        setCurrentVariantIndex(0);
                      }
                    }} className="absolute top-3 right-3 text-red-500 font-bold hover:text-red-700">✕</button>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Color / Variant Name *</label>
                        <input type="text" required value={variant.colorName} onChange={(e) => {
                          const newV = [...formData.variants];
                          newV[index].colorName = e.target.value;
                          newV[index].variantName = e.target.value;
                          setFormData({...formData, variants: newV});
                        }} className="w-full border border-[var(--border)] rounded px-3 py-1.5 text-sm" placeholder="e.g. Black" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Total Variant Stock (Auto sum from sizes)</label>
                        <input type="number" readOnly value={variant.stock || 0} className="w-full border border-[var(--border)] rounded px-3 py-1.5 text-sm bg-gray-100 text-gray-500" />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Variant Image URL</label>
                      <div className="flex gap-2">
                        <input type="text" value={variant.images?.[0] || ''} onChange={(e) => {
                          const newV = [...formData.variants];
                          if (!newV[index].images) newV[index].images = [];
                          newV[index].images[0] = e.target.value;
                          setFormData({...formData, variants: newV});
                        }} className="flex-1 border border-[var(--border)] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]" placeholder="Image URL..." />
                        <input type="file" id={`variant-upload-${index}`} onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          if (file.size > 800 * 1024) {
                            alert('Image must be under 800KB. Please compress your image.');
                            e.target.value = '';
                            return;
                          }
                          
                          const uploadData = new FormData();
                          uploadData.append('image', file);
                          try {
                            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload`, {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
                              body: uploadData
                            });
                            const result = await res.json();
                            if (result.success) {
                              const newV = [...formData.variants];
                              if (!newV[index].images) newV[index].images = [];
                              newV[index].images[0] = result.imageUrl || result.url || '';
                              setFormData({...formData, variants: newV});
                            } else {
                              alert(result.message || 'Image upload failed');
                            }
                          } catch (err) {
                            console.error(err);
                            alert('Error uploading image');
                          }
                        }} accept="image/*" className="hidden" />
                        <button type="button" onClick={() => document.getElementById(`variant-upload-${index}`).click()} className="bg-[#F1ECE5] px-4 py-1.5 rounded-md text-xs font-medium hover:bg-[#E5DED5]">
                          Upload
                        </button>
                      </div>
                      {variant.images?.[0] && <img src={variant.images[0]} className="mt-2 h-16 w-16 object-cover border rounded-md" alt="Variant preview" />}
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">Sizes & Inventory for {variant.colorName || 'this variant'}</label>
                      <div className="flex flex-col gap-4 bg-white p-4 border border-[var(--border)] rounded-md">
                        
                        {/* Alphabetical Sizes */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Top Sizes</h4>
                          <div className="flex flex-wrap gap-4">
                            {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map(size => {
                              const isChecked = variant.sizes?.includes(size);
                              return (
                                <div key={size} className="flex flex-col items-start gap-1 w-20">
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" checked={isChecked || false} onChange={(e) => {
                                      const newV = [...formData.variants];
                                      if (!newV[index].sizeInventory) newV[index].sizeInventory = {};
                                      if (e.target.checked) {
                                        newV[index].sizes = [...(newV[index].sizes || []), size];
                                        newV[index].sizeInventory[size] = 0;
                                      } else {
                                        newV[index].sizes = newV[index].sizes.filter(s => s !== size);
                                        delete newV[index].sizeInventory[size];
                                      }
                                      newV[index].stock = Object.values(newV[index].sizeInventory || {}).reduce((a,b)=>a+b, 0);
                                      setFormData({...formData, variants: newV});
                                    }} className="accent-[var(--accent)]" />
                                    <span className="text-xs font-medium">{size}</span>
                                  </label>
                                  {isChecked && (
                                    <input type="number" min="0" value={variant.sizeInventory?.[size] || 0} onChange={(e) => {
                                      const newV = [...formData.variants];
                                      if (!newV[index].sizeInventory) newV[index].sizeInventory = {};
                                      newV[index].sizeInventory[size] = parseInt(e.target.value) || 0;
                                      newV[index].stock = Object.values(newV[index].sizeInventory || {}).reduce((a,b)=>a+b, 0);
                                      setFormData({...formData, variants: newV});
                                    }} className="w-full border border-[var(--border)] rounded px-2 py-1 text-xs" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="h-px bg-gray-100 w-full"></div>

                        {/* Numerical Sizes */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Bottom Sizes</h4>
                          <div className="flex flex-wrap gap-4">
                            {['28', '30', '32', '34', '36', '38', '40', '42'].map(size => {
                              const isChecked = variant.sizes?.includes(size);
                              return (
                                <div key={size} className="flex flex-col items-start gap-1 w-20">
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" checked={isChecked || false} onChange={(e) => {
                                      const newV = [...formData.variants];
                                      if (!newV[index].sizeInventory) newV[index].sizeInventory = {};
                                      if (e.target.checked) {
                                        newV[index].sizes = [...(newV[index].sizes || []), size];
                                        newV[index].sizeInventory[size] = 0;
                                      } else {
                                        newV[index].sizes = newV[index].sizes.filter(s => s !== size);
                                        delete newV[index].sizeInventory[size];
                                      }
                                      newV[index].stock = Object.values(newV[index].sizeInventory || {}).reduce((a,b)=>a+b, 0);
                                      setFormData({...formData, variants: newV});
                                    }} className="accent-[var(--accent)]" />
                                    <span className="text-xs font-medium">{size}</span>
                                  </label>
                                  {isChecked && (
                                    <input type="number" min="0" value={variant.sizeInventory?.[size] || 0} onChange={(e) => {
                                      const newV = [...formData.variants];
                                      if (!newV[index].sizeInventory) newV[index].sizeInventory = {};
                                      newV[index].sizeInventory[size] = parseInt(e.target.value) || 0;
                                      newV[index].stock = Object.values(newV[index].sizeInventory || {}).reduce((a,b)=>a+b, 0);
                                      setFormData({...formData, variants: newV});
                                    }} className="w-full border border-[var(--border)] rounded px-2 py-1 text-xs" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );

  const requiredFields = [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price' },
    { key: 'img', label: 'Main Image' },
    { key: 'essentialCollection', label: 'Essential Collection' },
    { key: 'category', label: 'Main Category' }
  ];

  const missingFields = requiredFields.filter(f => !formData[f.key] || String(formData[f.key]).trim() === '');

  return (
    <div className="max-w-4xl mx-auto pb-24 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
        <button type="button" onClick={() => router.back()} className="text-sm font-medium text-[var(--text-muted)] hover:underline">← Back to Products</button>
      </div>
      
      {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">{error}</div>}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50 flex items-center gap-2 animate-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          {toastMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {renderBasicInfo()}
        {renderOrganization()}
        {renderMainSizes()}
        {renderVariants()}
        
        {/* Action Area */}
        <div className="mt-12 pt-6 border-t border-[var(--border)] flex items-center justify-end gap-4">
          <button 
            type="button" 
            onClick={() => {
              if (isDirty && !window.confirm("You have unsaved changes. Are you sure you want to discard them?")) return;
              router.push('/admin/products');
            }}
            className="px-5 py-2 text-sm font-medium text-[var(--foreground)] bg-transparent hover:bg-gray-50 border border-[var(--border)] rounded-md transition-colors"
          >
            Cancel
          </button>
          
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={loading} 
            className="flex items-center justify-center min-w-[140px] px-6 py-2 bg-[var(--foreground)] text-white text-sm font-medium rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEdit ? 'Updating Product...' : 'Creating Product...'}
              </div>
            ) : (isEdit ? 'Update Product' : 'Save Product')}
          </button>
        </div>
      </form>
    </div>
  );
}
