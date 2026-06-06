'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSettings() {
  const { token } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef(null);
  const [currentUploadTarget, setCurrentUploadTarget] = useState(null); // { type: 'hero', index: 0 } or { type: 'seasonal' }

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

  const triggerUpload = (target) => {
    setCurrentUploadTarget(target);
    fileInputRef.current.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUploadTarget) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data
      });
      const result = await res.json();
      if (result.success) {
        if (currentUploadTarget.type === 'seasonal') {
          handleSeasonalChange('image', result.url);
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
      if (section === 'seasonal') payload.seasonalBanner = settings.seasonalBanner;

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
              <div className="w-full h-32 bg-gray-100 rounded overflow-hidden relative">
                {settings.seasonalBanner.image ? (
                  <img src={settings.seasonalBanner.image} alt="Seasonal Banner" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400 absolute inset-0 flex items-center justify-center">No Image</span>
                )}
              </div>
              <button 
                onClick={() => triggerUpload({ type: 'seasonal' })}
                disabled={uploading}
                className="w-full text-center bg-[#F1ECE5] px-4 py-2 rounded-lg font-medium hover:bg-[#E5DED5] transition-colors"
              >
                Upload New Image
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
