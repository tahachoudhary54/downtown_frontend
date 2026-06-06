'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminSettings() {
  const router = useRouter();
  const { token } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const fileInputRef = useRef(null);
  const [currentUploadTarget, setCurrentUploadTarget] = useState(null); // { type: 'hero', index: 0 } or { type: 'seasonal' }

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
      }).then(() => router.refresh()).catch(console.error);
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

  const handleCategoryChange = (index, field, value) => {
    setSettings(prev => {
      const newCats = [...(prev.categories || [])];
      newCats[index] = { ...newCats[index], [field]: value };
      return { ...prev, categories: newCats };
    });
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
      if (data.success) {
        router.refresh();
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
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[var(--foreground)]">Seasonal Sale Banner</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer bg-[#F9F7F4] px-4 py-2 rounded-lg border border-[var(--border)]">
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
              className="bg-[var(--accent)] text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
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

            <div className="grid grid-cols-2 gap-4">
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--border)] mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[var(--foreground)]">Essential Collection Categories</h3>
          <button 
            onClick={() => handleSave('categories')}
            disabled={saving || uploading}
            className="bg-[var(--accent)] text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Categories'}
          </button>
        </div>

        <div className="space-y-4">
          <button onClick={handleAddCategory} className="w-full py-4 border-2 border-dashed border-[var(--border)] rounded-lg text-[var(--text-muted)] font-medium hover:bg-[#FAF8F5] transition-colors mb-4">
            + Add New Category
          </button>
          {(settings.categories || []).map((cat, index) => (
            <div key={index} className="border border-[var(--border)] p-4 rounded-lg flex items-start gap-4 relative">
              <div className="flex flex-col gap-2">
                <button onClick={() => handleMoveCategory(index, 'up')} disabled={index === 0} className="p-1 bg-gray-100 rounded disabled:opacity-30">&uarr;</button>
                <button onClick={() => handleMoveCategory(index, 'down')} disabled={index === (settings.categories || []).length - 1} className="p-1 bg-gray-100 rounded disabled:opacity-30">&darr;</button>
              </div>
              <div className="w-32 h-32 bg-gray-100 rounded overflow-hidden relative flex-shrink-0">
                {cat.img ? <img src={cat.img} alt="Category" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400 absolute inset-0 flex items-center justify-center">No Image</span>}
              </div>
              <div className="flex-grow grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[var(--text-muted)]">Name</label>
                  <input type="text" value={cat.name || ''} onChange={(e) => handleCategoryChange(index, 'name', e.target.value)} className="w-full border border-[var(--border)] rounded px-3 py-1.5 focus:outline-none focus:border-[var(--accent)] text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[var(--text-muted)]">Slug</label>
                  <input type="text" value={cat.slug || ''} onChange={(e) => handleCategoryChange(index, 'slug', e.target.value)} className="w-full border border-[var(--border)] rounded px-3 py-1.5 focus:outline-none focus:border-[var(--accent)] text-sm" />
                </div>
                <div className="space-y-2">
                  <button onClick={() => triggerUpload({ type: 'category', index })} disabled={uploading} className="text-sm bg-[#F1ECE5] px-3 py-1.5 rounded font-medium hover:bg-[#E5DED5] transition-colors w-full mt-6">
                    Upload Image
                  </button>
                </div>
                <div className="space-y-2 flex items-end justify-between col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input type="checkbox" checked={cat.isActive !== false} onChange={(e) => handleCategoryChange(index, 'isActive', e.target.checked)} className="w-4 h-4 accent-[var(--accent)]" />
                    <span className="font-medium text-sm text-[var(--foreground)]">Active</span>
                  </label>
                  <button onClick={() => handleRemoveCategory(index)} className="text-red-500 text-sm hover:underline font-medium mb-2">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
