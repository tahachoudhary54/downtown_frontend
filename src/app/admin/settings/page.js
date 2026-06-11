'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const POLICY_FIELDS = [
  { key: 'aboutUs', label: 'About Us' },
  { key: 'contactUs', label: 'Contact Us' },
  { key: 'termsAndConditions', label: 'Terms & Conditions' },
  { key: 'privacyPolicy', label: 'Privacy Policy' },
  { key: 'shippingAndReturns', label: 'Shipping & Returns' },
  { key: 'sizeGuide', label: 'Size Guide' },
  { key: 'faq', label: 'FAQ' }
];

export default function AdminSettings() {
  const { token } = useAuth();
  const [policies, setPolicies] = useState({
    aboutUs: '',
    contactUs: '',
    termsAndConditions: '',
    privacyPolicy: '',
    shippingAndReturns: '',
    sizeGuide: '',
    faq: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('aboutUs');

  useEffect(() => {
    fetchPolicies();
  }, [token]);

  const fetchPolicies = async () => {
    try {
      const res = await fetch(`${API_URL}/api/policies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPolicies(data.data);
      }
    } catch (err) {
      console.error('Error fetching policies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${API_URL}/api/policies`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(policies)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Policies saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save policies.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error while saving.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  if (loading) {
    return <div className="p-8 text-[var(--accent)]">Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-[var(--border)]">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Website Policies</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Manage all public policy pages</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--accent)] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        {/* Tabs sidebar */}
        <div className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-[var(--border)] flex md:flex-col overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {POLICY_FIELDS.map(field => (
            <button
              key={field.key}
              onClick={() => setActiveTab(field.key)}
              className={`whitespace-nowrap p-4 text-center md:text-left text-sm font-medium transition-colors border-r md:border-r-0 md:border-b border-[var(--border)] md:last:border-b-0
                ${activeTab === field.key ? 'bg-white text-[var(--accent)] border-b-4 border-b-[var(--accent)] md:border-b-0 md:border-l-4 md:border-l-[var(--accent)]' : 'text-[var(--text-muted)] hover:bg-gray-100 border-b-4 border-b-transparent md:border-b-0 md:border-l-4 md:border-l-transparent'}
              `}
            >
              {field.label}
            </button>
          ))}
        </div>
        
        {/* Editor Area */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[var(--foreground)]">
              Editing: {POLICY_FIELDS.find(f => f.key === activeTab)?.label}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Supports plain text and paragraphs. Line breaks will be preserved on the frontend.
            </p>
          </div>
          <textarea
            value={policies[activeTab] || ''}
            onChange={(e) => setPolicies({ ...policies, [activeTab]: e.target.value })}
            className="flex-1 w-full p-4 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] resize-none"
            placeholder={`Enter ${POLICY_FIELDS.find(f => f.key === activeTab)?.label} content here...`}
            style={{ minHeight: '400px' }}
          />
        </div>
      </div>
    </div>
  );
}
