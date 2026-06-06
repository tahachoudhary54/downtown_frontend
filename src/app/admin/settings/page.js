'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSettings() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    storeName: '',
    contactEmail: '',
    phoneNumber: '',
    currency: 'USD',
    flatShippingRate: 15.00,
    socialLinks: {
      instagram: '',
      facebook: '',
      twitter: ''
    }
  });
  const [whatsapp, setWhatsapp] = useState({
    enabled: false,
    adminNumber: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`);
        const data = await res.json();
        if (data.success) {
          if (data.data.store) setSettings(data.data.store);
          if (data.data.whatsapp) {
            setWhatsapp({
              enabled: data.data.whatsapp.enabled || false,
              adminNumber: data.data.whatsapp.adminNumber || ''
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('whatsapp_')) {
      const field = name.split('_')[1];
      setWhatsapp(prev => ({
        ...prev,
        [field]: type === 'checkbox' ? checked : value
      }));
      return;
    }

    if (name.startsWith('social_')) {
      const platform = name.split('_')[1];
      setSettings(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [platform]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ store: settings, whatsapp })
      });
      const data = await res.json();
      if (data.success) {
        alert('Settings saved successfully!');
      } else {
        alert(data.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--text-muted)]">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Store Settings</h2>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-[var(--border)]">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* General Information */}
          <div>
            <h3 className="text-lg font-bold border-b border-[var(--border)] pb-2 mb-4">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-muted)]">Store Name</label>
                <input 
                  type="text" name="storeName" value={settings.storeName} onChange={handleChange} required
                  className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-muted)]">Contact Email</label>
                <input 
                  type="email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} required
                  className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-muted)]">Phone Number</label>
                <input 
                  type="text" name="phoneNumber" value={settings.phoneNumber} onChange={handleChange}
                  className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div>
            <h3 className="text-lg font-bold border-b border-[var(--border)] pb-2 mb-4">Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-muted)]">Currency</label>
                <select 
                  name="currency" value={settings.currency} onChange={handleChange}
                  className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)] bg-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-muted)]">Flat Shipping Rate</label>
                <input 
                  type="number" step="0.01" name="flatShippingRate" value={settings.flatShippingRate} onChange={handleChange} required
                  className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-bold border-b border-[var(--border)] pb-2 mb-4">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-muted)]">Instagram URL</label>
                <input 
                  type="url" name="social_instagram" value={settings.socialLinks?.instagram || ''} onChange={handleChange}
                  className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Notifications */}
          <div>
            <h3 className="text-lg font-bold border-b border-[var(--border)] pb-2 mb-4">WhatsApp Notifications</h3>
            <div className="bg-[#FAF8F5] p-6 rounded-lg border border-[var(--border)]">
              <div className="flex items-center gap-3 mb-6">
                <input 
                  type="checkbox" 
                  id="whatsapp_enabled"
                  name="whatsapp_enabled" 
                  checked={whatsapp.enabled} 
                  onChange={handleChange}
                  className="w-5 h-5 text-[var(--accent)] border-[var(--border)] rounded focus:ring-[var(--accent)]"
                />
                <label htmlFor="whatsapp_enabled" className="text-sm font-bold text-[var(--foreground)] cursor-pointer">
                  Enable WhatsApp Notifications
                </label>
              </div>

              {whatsapp.enabled && (
                <div className="space-y-4 max-w-md animate-fade-in">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[var(--text-muted)]">Admin WhatsApp Number</label>
                    <input 
                      type="text" 
                      name="whatsapp_adminNumber" 
                      value={whatsapp.adminNumber} 
                      onChange={handleChange} 
                      placeholder="+919876543210"
                      className="w-full border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)] bg-white"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">Include country code (e.g. +91 for India)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-[var(--accent)] text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
