'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleRoleToggle = async (id, currentRole) => {
    if (!confirm(`Change this user's role to ${currentRole === 'admin' ? 'user' : 'admin'}?`)) return;
    
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/${id}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Users</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F9F7F4] text-[var(--text-muted)] border-b border-[var(--border)]">
              <tr>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Verified</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 animate-pulse">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-[var(--border)] hover:bg-[#FAF8F5] transition-colors">
                    <td className="p-4 font-medium text-[var(--foreground)]">{user.name}</td>
                    <td className="p-4 text-[var(--text-muted)]">{user.email}</td>
                    <td className="p-4">
                      {user.isVerified ? (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">Verified</span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded">Pending</span>
                      )}
                    </td>
                    <td className="p-4">
                      {user.role === 'admin' ? (
                        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded uppercase tracking-wider">Admin</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded uppercase tracking-wider">User</span>
                      )}
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleRoleToggle(user._id, user.role)} 
                        className="text-[var(--accent)] hover:text-opacity-80 font-medium whitespace-nowrap"
                      >
                        Make {user.role === 'admin' ? 'User' : 'Admin'}
                      </button>
                      <span className="text-gray-300">|</span>
                      <button 
                        onClick={() => handleDelete(user._id, user.name)} 
                        className="text-red-500 hover:text-red-600 font-medium whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
