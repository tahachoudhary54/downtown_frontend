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

const DEFAULT_SIZE_GUIDE = {
  heroTitle: "Find Your Perfect Fit",
  heroSubtitle: "Detailed measurements and fit guidance to ensure your selections are perfectly tailored to you.",
  tableHeaders: ["Size", "Chest (in)", "Waist (in)", "Sleeve (in)", "Neck (in)"],
  tableRows: [
    ["S", "38-40", "32-34", "33.5", "15-15.5"],
    ["M", "42-44", "36-38", "34.5", "16-16.5"],
    ["L", "46-48", "40-42", "35.5", "17-17.5"],
    ["XL", "50-52", "44-46", "36.5", "18-18.5"],
    ["XXL", "54-56", "48-50", "37.5", "19-19.5"]
  ],
  bottomsTableHeaders: ["Size", "Waist (in)", "Hip (in)", "Inseam (in)"],
  bottomsTableRows: [
    ["28", "29-30", "35-36", "32"],
    ["30", "31-32", "37-38", "32"],
    ["32", "33-34", "39-40", "32"],
    ["34", "35-36", "41-42", "34"],
    ["36", "37-38", "43-44", "34"],
    ["38", "39-40", "45-46", "34"],
    ["40", "41-42", "47-48", "34"],
    ["42", "43-44", "49-50", "34"]
  ],
  fitCards: [
    { title: "Slim Fit", desc: "Tailored close to the body for a sharp, modern silhouette. Ideal for a refined look." },
    { title: "Regular Fit", desc: "A classic, comfortable cut with moderate room through the chest and waist." },
    { title: "Relaxed Fit", desc: "Generously cut for ease of movement and a more casual, laid-back aesthetic." }
  ],
  measurementSteps: [
    { title: "Chest", desc: "Measure under your arms, around the fullest part of your chest." },
    { title: "Waist", desc: "Measure around your natural waistline, keeping the tape comfortably loose." },
    { title: "Sleeve", desc: "Start at the center back of your neck, measure across the shoulder to your wrist." }
  ],
  expertTip: "If you are between sizes for a tailored garment, we recommend selecting the larger size and consulting a tailor for the perfect finish."
};

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
            {activeTab === 'sizeGuide' ? (
              <p className="text-xs text-[var(--text-muted)] mt-1">
                You can edit the JSON layout directly below to update the size chart.
              </p>
            ) : (
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Supports plain text and paragraphs. Line breaks will be preserved on the frontend.
              </p>
            )}
          </div>
          
          {activeTab === 'sizeGuide' ? (
            <textarea
              value={
                typeof policies[activeTab] === 'object' && policies[activeTab] !== null
                  ? JSON.stringify(policies[activeTab], null, 2)
                  : (policies[activeTab] ? policies[activeTab] : JSON.stringify(DEFAULT_SIZE_GUIDE, null, 2))
              }
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setPolicies({ ...policies, [activeTab]: parsed });
                } catch (err) {
                  // If it's invalid JSON while typing, store it as a string temporarily
                  setPolicies({ ...policies, [activeTab]: e.target.value });
                }
              }}
              className="flex-1 w-full p-4 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] resize-none font-mono text-sm bg-gray-50"
              placeholder={`Enter JSON data for the Size Guide...`}
              style={{ minHeight: '500px' }}
            />
          ) : (
            <textarea
              value={policies[activeTab] || ''}
              onChange={(e) => setPolicies({ ...policies, [activeTab]: e.target.value })}
              className="flex-1 w-full p-4 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] resize-none"
              placeholder={`Enter ${POLICY_FIELDS.find(f => f.key === activeTab)?.label} content here...`}
              style={{ minHeight: '400px' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
