'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({ products: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, usersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const productsData = await productsRes.json();
        const usersData = await usersRes.json();

        setStats({
          products: productsData.success ? productsData.pagination?.total || productsData.data.length : 0,
          users: usersData.success ? usersData.data.length : 0,
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchStats();
  }, [token]);

  if (loading) {
    return <div className="animate-pulse text-[var(--accent)] font-medium">Loading Dashboard Data...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue Stat Card (Mock) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--border)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Revenue</h3>
              <span className="text-green-500 bg-green-50 px-2 py-1 rounded text-xs font-bold">+14%</span>
            </div>
            <p className="text-3xl font-bold text-[var(--foreground)] mt-3">₹45,231</p>
          </div>
          <div className="mt-5 pt-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
            Compared to last month
          </div>
        </div>

        {/* Orders Stat Card (Mock) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--border)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Orders</h3>
              <span className="text-green-500 bg-green-50 px-2 py-1 rounded text-xs font-bold">+8%</span>
            </div>
            <p className="text-3xl font-bold text-[var(--foreground)] mt-3">128</p>
          </div>
          <div className="mt-5 pt-4 border-t border-[var(--border)]">
            <Link href="/admin/orders" className="text-xs font-semibold text-[var(--accent)] hover:underline uppercase tracking-wide">
              View All Orders &rarr;
            </Link>
          </div>
        </div>

        {/* Products Stat Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--border)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Active Products</h3>
            </div>
            <p className="text-3xl font-bold text-[var(--foreground)] mt-3">{stats.products}</p>
          </div>
          <div className="mt-5 pt-4 border-t border-[var(--border)]">
            <Link href="/admin/products" className="text-xs font-semibold text-[var(--accent)] hover:underline uppercase tracking-wide">
              Manage Catalog &rarr;
            </Link>
          </div>
        </div>

        {/* Users Stat Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--border)] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Registered Users</h3>
              <span className="text-green-500 bg-green-50 px-2 py-1 rounded text-xs font-bold">+22%</span>
            </div>
            <p className="text-3xl font-bold text-[var(--foreground)] mt-3">{stats.users}</p>
          </div>
          <div className="mt-5 pt-4 border-t border-[var(--border)]">
            <Link href="/admin/users" className="text-xs font-semibold text-[var(--accent)] hover:underline uppercase tracking-wide">
              Manage Customers &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
          <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
            <h2 className="text-lg font-bold text-[var(--foreground)]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-[var(--accent)] hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { id: '#ORD-0921', name: 'John Doe', date: 'Today, 10:24 AM', amount: '₹1,299', status: 'Processing', color: 'bg-yellow-100 text-yellow-800' },
                  { id: '#ORD-0920', name: 'Sarah Smith', date: 'Yesterday', amount: '₹4,500', status: 'Shipped', color: 'bg-blue-100 text-blue-800' },
                  { id: '#ORD-0919', name: 'Michael Brown', date: 'Yesterday', amount: '₹899', status: 'Delivered', color: 'bg-green-100 text-green-800' },
                  { id: '#ORD-0918', name: 'Emma Wilson', date: 'Oct 24, 2023', amount: '₹2,150', status: 'Delivered', color: 'bg-green-100 text-green-800' },
                ].map((order, i) => (
                  <tr key={i} className="border-b border-[var(--border)] hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-6 py-4 font-medium">{order.id}</td>
                    <td className="px-6 py-4">{order.name}</td>
                    <td className="px-6 py-4 text-[var(--text-muted)]">{order.date}</td>
                    <td className="px-6 py-4 font-medium">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.color}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Analytics */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--border)]">
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/admin/products/new" className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white transition-all group">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] group-hover:bg-white/20 flex items-center justify-center text-[var(--accent)] group-hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <div className="font-medium">Add New Product</div>
              </Link>
              <Link href="/admin/cms" className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white transition-all group">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] group-hover:bg-white/20 flex items-center justify-center text-[var(--accent)] group-hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <div className="font-medium">Update Homepage Banner</div>
              </Link>
            </div>
          </div>
          
          <div className="bg-[var(--accent)] text-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-2">Need Help?</h2>
            <p className="text-sm text-white/80 mb-4">View the documentation or contact support for assistance with the Admin Panel.</p>
            <button className="bg-white text-[var(--accent)] px-4 py-2 rounded font-bold text-sm w-full hover:bg-gray-100 transition-colors">
              Contact Support
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
