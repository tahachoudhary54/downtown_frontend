'use client';

import { useState, useEffect, useRef, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminSettings() {
  const router = useRouter();
  const { token } = useAdminAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const fileInputRef = useRef(null);
  const [currentUploadTarget, setCurrentUploadTarget] = useState(null); // { type: 'hero', index: 0 } or { type: 'seasonal' }
  const [catPage, setCatPage] = useState(1);
  const catLimit = 5;

  // Debounced Auto-save for Seasonal Banner
  useEffect(() => {
    if (!settings || !token) return;
    const timer = setTimeout(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ seasonalBanner: settings.seasonalBanner })
      }).catch(console.error);
    }, 1000);
    return () => clearTimeout(timer);
  }, [settings?.seasonalBanner, token, router]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`);
        const data = await res.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSeasonalChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      seasonalBanner: { ...prev.seasonalBanner, [field]: value }
    }));
  };

  const handleCategoryChange = async (index, field, value) => {
    const newCats = [...(settings.categories || [])];
    newCats[index] = { ...newCats[index], [field]: value };
    
    setSettings(prev => ({ ...prev, categories: newCats }));

    if (field === 'isActive') {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ categories: newCats })
        });
        const data = await res.json();
        if (!data.success) {
          console.error("Failed to save on server:", data.message);
        } else {
          startTransition(() => {
            router.refresh();
          });
        }
      } catch (err) {
        console.error("Failed to auto-save category status", err);
      }
    }
  };

  const handleAddCategory = () => {
    setSettings(prev => {
      const existing = prev.categories || [];
      const newCategory = { id: Date.now().toString(), name: 'New Category', slug: 'new-category', img: '', isActive: true, displayOrder: 0 };
      const updatedCategories = [newCategory, ...existing].map((cat, idx) => ({ ...cat, displayOrder: idx }));
      return {
        ...prev,
        categories: updatedCategories
      };
    });
  };

  const handleRemoveCategory = async (index) => {
    const newCats = [...(settings.categories || [])];
    newCats.splice(index, 1);
    
    // Update local state
    setSettings(prev => ({ ...prev, categories: newCats }));
    
    // Auto-save to database instantly
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ categories: newCats })
      });
      const data = await res.json();
      if (!data.success) {
        console.error("Failed to auto-save category removal");
      } else {
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err) {
      console.error("Failed to auto-save category removal", err);
    }
  };

  const handleMoveCategory = (index, direction) => {
    setSettings(prev => {
      const newCats = [...(prev.categories || [])];
      if (direction === 'up' && index > 0) {
        const temp = newCats[index];
        newCats[index] = newCats[index - 1];
        newCats[index - 1] = temp;
      } else if (direction === 'down' && index < newCats.length - 1) {
        const temp = newCats[index];
        newCats[index] = newCats[index + 1];
        newCats[index + 1] = temp;
      }
      newCats.forEach((c, i) => c.displayOrder = i);
      return { ...prev, categories: newCats };
    });
  };

  const triggerUpload = (target) => {
    setCurrentUploadTarget(target);
    fileInputRef.current.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUploadTarget) return;

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
        if (currentUploadTarget.type === 'seasonal') {
          setPreviewImage(result.imageUrl || result.url);
        } else if (currentUploadTarget.type === 'category') {
          handleCategoryChange(currentUploadTarget.index, 'img', result.imageUrl || result.url);
        }
      } else {
        alert(result.message || 'Image upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading image');
    } finally {
      setUploading(false);
      setCurrentUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (section) => {
    setSaving(true);
    try {
      const payload = {};
      if (section === 'seasonal') {
        const updatedBanner = { ...settings.seasonalBanner };
        if (previewImage) {
          updatedBanner.image = previewImage;
          setSettings(prev => ({ ...prev, seasonalBanner: updatedBanner }));
          setPreviewImage(null);
        }
        payload.seasonalBanner = updatedBanner;
      }
      if (section === 'categories') {
        const names = settings.categories.map(c => (c.name || '').toLowerCase().trim());
        const slugs = settings.categories.map(c => (c.slug || '').toLowerCase().trim());
        const hasDuplicateNames = new Set(names).size !== names.length;
        const hasDuplicateSlugs = new Set(slugs).size !== slugs.length;
        
        if (hasDuplicateNames) {
          alert('Error: You cannot have multiple categories with the exact same name.');
          setSaving(false);
          return;
        }
        if (hasDuplicateSlugs) {
          alert('Error: You cannot have multiple categories with the exact same slug.');
          setSaving(false);
          return;
        }
        payload.categories = settings.categories;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert('Settings saved successfully!');
        router.refresh();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse p-8 font-medium">Loading CMS Settings...</div>;
  if (!settings) return <div className="p-8 text-red-500">Failed to load settings.</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Homepage CMS</h2>
      </div>

      <input 
        type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" 
      />

      {/* Seasonal Sale Banner CMS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--border)]">
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-xl font-bold text-[var(--foreground)]">Seasonal Sale Banner</h3>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <label className="flex flex-1 md:flex-none justify-center items-center gap-2 cursor-pointer bg-[#F9F7F4] px-4 py-2 rounded-lg border border-[var(--border)]">
              <input 
                type="checkbox" 
                checked={settings.seasonalBanner.enabled} 
                onChange={(e) => handleSeasonalChange('enabled', e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              <span className="font-semibold text-sm text-[var(--foreground)]">Enable Banner</span>
            </label>
            <button 
              onClick={() => handleSave('seasonal')}
              disabled={saving || uploading}
              className="bg-[var(--accent)] text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 flex-1 md:flex-none whitespace-nowrap text-center"
            >
              {saving ? 'Saving...' : 'Save Banner Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-muted)]">Title (Use \n for new line)</label>
              <textarea 
                value={settings.seasonalBanner.title} onChange={(e) => handleSeasonalChange('title', e.target.value)} rows="3"
                className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
              ></textarea>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-muted)]">Subtitle</label>
              <input 
                type="text" value={settings.seasonalBanner.subtitle || ''} onChange={(e) => handleSeasonalChange('subtitle', e.target.value)}
                className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-muted)]">Description (Use \n for new line)</label>
              <textarea 
                value={settings.seasonalBanner.description || ''} onChange={(e) => handleSeasonalChange('description', e.target.value)} rows="3"
                className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-muted)]">Button Text</label>
                <input 
                  type="text" value={settings.seasonalBanner.buttonText} onChange={(e) => handleSeasonalChange('buttonText', e.target.value)}
                  className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-muted)]">Button Link</label>
                <input 
                  type="text" value={settings.seasonalBanner.buttonLink} onChange={(e) => handleSeasonalChange('buttonLink', e.target.value)}
                  className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase text-[var(--text-muted)] tracking-wider">Banner Image</h4>
            <div className="border border-[var(--border)] p-4 rounded-lg flex flex-col items-center gap-4">
              <div className="w-full h-32 bg-gray-100 rounded overflow-hidden relative group">
                {(previewImage || settings.seasonalBanner.image) ? (
                  <>
                    <img src={previewImage || settings.seasonalBanner.image} alt="Seasonal Banner" className="w-full h-full object-cover" />
                    {previewImage && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow font-bold">Unsaved Preview</span>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-gray-400 absolute inset-0 flex items-center justify-center">No Image</span>
                )}
              </div>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => triggerUpload({ type: 'seasonal' })}
                  disabled={uploading}
                  className="flex-1 text-center bg-[#F1ECE5] px-4 py-2 rounded-lg font-medium hover:bg-[#E5DED5] transition-colors"
                >
                  Upload New Image
                </button>
                {previewImage && (
                  <button 
                    onClick={() => setPreviewImage(null)}
                    className="px-4 py-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors whitespace-nowrap"
                  >
                    Remove New Image
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories CMS */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-[var(--border)] mt-8">
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-xl font-bold text-[var(--foreground)]">Essential Collection Categories</h3>
          <button 
            onClick={() => handleSave('categories')}
            disabled={saving || uploading}
            className="bg-[var(--accent)] text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 w-full md:w-auto"
          >
            {saving ? 'Saving...' : 'Save Categories'}
          </button>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleAddCategory} 
            className="w-full py-5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold tracking-wide hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[#FAF8F5] transition-all duration-300 flex items-center justify-center gap-2 mb-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add New Category
          </button>
          
          <div className="grid gap-6">
            {(() => {
              const totalCatPages = Math.ceil((settings.categories || []).length / catLimit) || 1;
              const paginatedCategories = (settings.categories || []).slice((catPage - 1) * catLimit, catPage * catLimit);

              return (
                <>
                  {paginatedCategories.map((cat, index) => {
                    const globalIndex = (catPage - 1) * catLimit + index;
                    return (
                      <div key={globalIndex} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 relative group overflow-hidden w-full">
                        
                        {/* Reorder Controls */}
                        <div className="flex md:flex-col gap-2 items-center justify-center order-last md:order-first w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                          <button 
                            onClick={() => handleMoveCategory(globalIndex, 'up')} 
                            disabled={globalIndex === 0} 
                            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                          </button>
                          <button 
                            onClick={() => handleMoveCategory(globalIndex, 'down')} 
                            disabled={globalIndex === (settings.categories || []).length - 1} 
                            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </button>
                        </div>

                {/* Image Section */}
                <div className="relative w-32 h-32 rounded-xl border border-gray-200 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center mx-auto md:mx-0 shadow-inner group-hover:border-[var(--accent)] transition-colors">
                  {cat.img ? (
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">No Image</span>
                  )}
                  
                  {/* Hover Upload Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button 
                      onClick={() => triggerUpload({ type: 'category', index: globalIndex })} 
                      disabled={uploading} 
                      className="bg-white/90 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-white transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="flex-grow w-full space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Category Name</label>
                      <input 
                        type="text" 
                        value={cat.name || ''} 
                        onChange={(e) => handleCategoryChange(globalIndex, 'name', e.target.value)} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] text-sm font-medium transition-all" 
                        placeholder="e.g. SUMMER WEAR"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">URL Slug</label>
                      <input 
                        type="text" 
                        value={cat.slug || ''} 
                        onChange={(e) => handleCategoryChange(globalIndex, 'slug', e.target.value)} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] text-sm font-medium transition-all"
                        placeholder="e.g. summer-wear"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => handleCategoryChange(globalIndex, 'isActive', cat.isActive === false ? true : false)}
                      className="flex items-center gap-3 cursor-pointer group/toggle focus:outline-none"
                    >
                      <div className="relative flex items-center">
                        <div className={`w-10 h-6 rounded-full transition-colors duration-200 ease-in-out flex items-center px-0.5 ${cat.isActive !== false ? 'bg-[var(--accent)]' : 'bg-gray-200'}`}>
                          <div className={`bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${cat.isActive !== false ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-gray-700 group-hover/toggle:text-[var(--accent)] transition-colors">
                        {cat.isActive !== false ? 'Active Status' : 'Hidden Status'}
                      </span>
                    </button>

                    <button 
                      onClick={() => handleRemoveCategory(globalIndex)} 
                      className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-bold text-xs uppercase tracking-wider"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      Remove
                    </button>
                  </div>
                </div>

              </div>
                    );
                  })}
                  {totalCatPages > 1 && (
                    <div className="p-4 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 rounded-xl">
                      <span className="text-sm text-[var(--text-muted)]">
                        Showing page {catPage} of {totalCatPages}
                      </span>
                      <div className="space-x-2">
                        <button 
                          disabled={catPage === 1} 
                          onClick={() => setCatPage(p => p - 1)}
                          className="px-3 py-1 bg-white border border-[var(--border)] rounded text-sm disabled:opacity-50 hover:bg-[#F9F7F4] shadow-sm transition-colors"
                        >
                          Previous
                        </button>
                        <button 
                          disabled={catPage === totalCatPages} 
                          onClick={() => setCatPage(p => p + 1)}
                          className="px-3 py-1 bg-white border border-[var(--border)] rounded text-sm disabled:opacity-50 hover:bg-[#F9F7F4] shadow-sm transition-colors"
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
        </div>
      </div>
    </div>
  );
}
