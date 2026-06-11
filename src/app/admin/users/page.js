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

      <div className="md:bg-white md:rounded-xl md:shadow-sm md:border md:border-[var(--border)] overflow-hidden">
        <div>
          <table className="w-full text-left text-sm block md:table">
            <thead className="bg-[#F9F7F4] text-[var(--text-muted)] border-b border-[var(--border)] hidden md:table-header-group">
              <tr>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Verified</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {loading ? (
                <tr className="block md:table-row bg-white rounded-xl shadow-sm border border-[var(--border)] mb-4 md:mb-0 md:rounded-none md:shadow-none md:border-0 md:border-b">
                  <td colSpan="5" className="block md:table-cell p-8 text-center text-gray-500 animate-pulse">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr className="block md:table-row bg-white rounded-xl shadow-sm border border-[var(--border)] mb-4 md:mb-0 md:rounded-none md:shadow-none md:border-0 md:border-b">
                  <td colSpan="5" className="block md:table-cell p-8 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="bg-white rounded-xl shadow-sm border border-[var(--border)] mb-4 md:mb-0 md:rounded-none md:shadow-none md:border-0 md:border-b md:border-[var(--border)] hover:bg-[#FAF8F5] transition-colors block md:table-row p-4 md:p-0">
                    <td className="block md:table-cell md:p-4 font-medium text-[var(--foreground)] mb-2 md:mb-0">
                      <span className="md:hidden font-semibold text-xs text-gray-500 uppercase mr-2">Name:</span>
                      {user.name}
                    </td>
                    <td className="block md:table-cell md:p-4 text-[var(--text-muted)] mb-2 md:mb-0 break-all sm:break-normal">
                      <span className="md:hidden font-semibold text-xs text-gray-500 uppercase mr-2">Email:</span>
                      {user.email}
                    </td>
                    <td className="block md:table-cell md:p-4 mb-2 md:mb-0 flex items-center">
                      <span className="md:hidden font-semibold text-xs text-gray-500 uppercase mr-2">Status:</span>
                      {user.isVerified ? (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">Verified</span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded">Pending</span>
                      )}
                    </td>
                    <td className="block md:table-cell md:p-4 mb-3 md:mb-0 flex items-center">
                      <span className="md:hidden font-semibold text-xs text-gray-500 uppercase mr-2">Role:</span>
                      {user.role === 'admin' ? (
                        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded uppercase tracking-wider">Admin</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded uppercase tracking-wider">User</span>
                      )}
                    </td>
                    <td className="flex md:table-cell md:p-4 items-center justify-start md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-0 border-gray-100">
                      <button 
                        onClick={() => handleRoleToggle(user._id, user.role)} 
                        className="text-[var(--accent)] hover:text-opacity-80 font-medium whitespace-nowrap"
                      >
                        Make {user.role === 'admin' ? 'User' : 'Admin'}
                      </button>
                      <span className="text-gray-300 mx-2">|</span>
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
