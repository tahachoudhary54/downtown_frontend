'use client';

import { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useNotifications } from '@/context/NotificationsContext';
import Image from 'next/image';

import { useRouter } from 'next/navigation';

export default function AdminCategories() {
  const { token } = useAdminAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const formRef = useRef(null);

  const handleEdit = (category) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      slug: category.slug
    });
    setError('');
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', slug: '' });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newFormData = { ...formData, [name]: type === 'checkbox' ? checked : value };
    if (name === 'name' && !editingId) {
      newFormData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`;
      
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        await fetchCategories();
        router.refresh();
        handleCancel();
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      setError('Server Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        await fetchCategories();
        router.refresh();
      } else {
        alert(data.message || 'Deletion failed. A product might still be using this category.');
      }
    } catch (err) {
      console.error(err);
      alert('Delete failed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-[var(--text-muted)]">Loading categories...</div>;

  return (
    <div className="space-y-8" ref={formRef}>
      {/* Category Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--border)]">
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border rounded px-3 py-2 text-sm focus:border-[var(--accent)] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Slug</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="w-full border rounded px-3 py-2 text-sm focus:border-[var(--accent)] outline-none" />
            </div>


          </div>

          <div className="flex justify-end gap-3 pt-2">
            {editingId && (
              <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                Cancel
              </button>
            )}
            <button type="submit" disabled={isSaving} className="px-6 py-2 text-sm bg-[var(--accent)] text-white rounded font-medium disabled:opacity-50">
              {isSaving ? 'Saving...' : (editingId ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>

      {/* Category List */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF8F5] border-b border-[var(--border)]">

              <th className="p-4 font-semibold text-[var(--foreground)] text-sm w-[40%]">Name</th>
              <th className="p-4 font-semibold text-[var(--foreground)] text-sm w-[40%]">Slug</th>


              <th className="p-4 font-semibold text-[var(--foreground)] text-sm text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="border-b border-[var(--border)] hover:bg-[#FAF8F5] transition-colors">

                <td className="p-4 font-medium text-[var(--foreground)] text-sm">{cat.name}</td>
                <td className="p-4 text-[var(--text-muted)] text-sm">{cat.slug}</td>


                <td className="p-4 text-right space-x-3 whitespace-nowrap">
                  <button type="button" onClick={() => handleEdit(cat)} className="text-[var(--accent)] hover:underline text-sm font-medium">Edit</button>
                  <button type="button" onClick={() => handleDelete(cat._id)} className="text-red-500 hover:underline text-sm font-medium">Delete</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan="3" className="p-8 text-center text-[var(--text-muted)] text-sm">No categories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
