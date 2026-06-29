'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminCollections() {
  const { token } = useAuth();
  
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    banner: '',
    isActive: true,
    homepageOrder: 0
  });

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/collections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCollections(data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCollections();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/collections${formData._id ? `/${formData._id}` : ''}`;
      const method = formData._id ? 'PUT' : 'POST';
      
      const payload = { ...formData, slug: formData.name.toLowerCase().replace(/\s+/g, '-') };

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
        fetchCollections();
        setIsEditing(false);
        setFormData({ name: '', description: '', banner: '', isActive: true, homepageOrder: 0 });
      } else {
        setError(data.message || 'Error saving collection');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save collection');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/collections/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchCollections();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (collection = null) => {
    if (collection) {
      setFormData(collection);
    } else {
      setFormData({ name: '', description: '', banner: '', isActive: true, homepageOrder: 0 });
    }
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Essential Collections</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Manage reusable collections for your homepage and product tagging.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => startEdit()}
            className="bg-[var(--foreground)] text-white px-5 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
          >
            + Create Collection
          </button>
        )}
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">{error}</div>}

      {isEditing ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--border)] max-w-2xl">
          <h3 className="font-bold text-lg mb-4">{formData._id ? 'Edit Collection' : 'New Collection'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection Name *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent)]" placeholder="e.g. Summer 2026" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent)]" rows="3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
              <input type="text" value={formData.banner} onChange={e => setFormData({...formData, banner: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent)]" placeholder="https://..." />
            </div>
            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4" />
                <span className="text-sm font-medium">Active (Visible on store)</span>
              </label>
              <label className="flex items-center gap-2">
                <span className="text-sm font-medium">Homepage Order:</span>
                <input type="number" value={formData.homepageOrder} onChange={e => setFormData({...formData, homepageOrder: parseInt(e.target.value) || 0})} className="w-16 border rounded px-2 py-1 text-sm text-center" />
              </label>
            </div>
            <div className="pt-4 border-t flex justify-end gap-3">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium">Save Collection</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F9F7F4] text-[var(--text-muted)] border-b border-[var(--border)]">
              <tr>
                <th className="p-4 font-semibold">Banner</th>
                <th className="p-4 font-semibold">Name / Slug</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-center">Order</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading collections...</td></tr>
              ) : collections.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No collections found.</td></tr>
              ) : collections.map(c => (
                <tr key={c._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    {c.banner ? <img src={c.banner} className="w-16 h-10 object-cover rounded border" /> : <div className="w-16 h-10 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">No Image</div>}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{c.slug}</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="p-4 text-center font-bold text-gray-600">{c.homepageOrder}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => startEdit(c)} className="text-blue-600 hover:underline text-sm font-medium mr-3">Edit</button>
                    <button onClick={() => handleDelete(c._id)} className="text-red-600 hover:underline text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
