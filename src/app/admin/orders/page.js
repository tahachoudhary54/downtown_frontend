'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';

const STATUS_COLORS = {
  'Pending Delivery Quote': 'bg-orange-100 text-orange-800',
  'Waiting for Customer Confirmation': 'bg-purple-100 text-purple-800',
  'Confirmed': 'bg-indigo-100 text-indigo-800',
  Processing: 'bg-yellow-100 text-yellow-800',
  Shipped: 'bg-blue-100 text-blue-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function AdminOrders() {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [deliveryQuotes, setDeliveryQuotes] = useState({});

  const fetcher = (url) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const { data, mutate, isLoading } = useSWR(
    token ? `${apiBase}/api/orders` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const orders = data?.data || [];

  const filtered = orders.filter((order) => {
    const matchesSearch =
      order.customer?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(search.toLowerCase()) ||
      order._id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await fetch(`${apiBase}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      mutate(); // Re-fetch
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSendQuote = async (orderId) => {
    const cost = deliveryQuotes[orderId];
    if (!cost) return alert('Please enter a delivery cost');
    
    setUpdatingId(orderId);
    try {
      await fetch(`${apiBase}/api/orders/${orderId}/delivery-quote`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deliveryCharge: cost }),
      });
      mutate();
    } catch (err) {
      console.error('Failed to send quote', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    
    setUpdatingId(orderId);
    try {
      await fetch(`${apiBase}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      mutate();
    } catch (err) {
      console.error('Failed to delete order', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.financials?.total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Orders</h2>
        <div className="flex gap-4 text-sm">
          <span className="bg-white border border-[var(--border)] px-4 py-2 rounded-lg font-medium">
            Total Orders: <strong>{orders.length}</strong>
          </span>
          <span className="bg-white border border-[var(--border)] px-4 py-2 rounded-lg font-medium">
            Total Revenue: <strong>₹{totalRevenue.toLocaleString('en-IN')}</strong>
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, email or order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)] bg-white"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="Pending Delivery Quote">Pending Delivery Quote</option>
          <option value="Waiting for Customer Confirmation">Waiting for Customer Confirmation</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[var(--text-muted)] animate-pulse">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-[var(--text-muted)] mb-2">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="font-medium text-[var(--foreground)]">No orders found</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Orders will appear here once customers place them.</p>
          </div>
        ) : (
          <div>
            <table className="w-full text-sm block md:table">
              <thead className="hidden md:table-header-group bg-[var(--bg)] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Order ID</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Items</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Payment</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group divide-y-0 md:divide-y md:divide-[var(--border)]">
                {filtered.map((order) => (
                  <tr key={order._id} className="border border-[var(--border)] m-4 md:m-0 rounded-xl md:rounded-none md:border-0 hover:bg-[var(--bg)] transition-colors block md:table-row bg-white overflow-hidden shadow-sm md:shadow-none">
                    <td className="block md:table-cell px-6 py-3 md:py-4 font-mono text-xs text-[var(--text-muted)] border-b border-gray-100 md:border-b-0">
                      <span className="md:hidden font-semibold text-xs text-gray-500 mr-2 uppercase block mb-1">Order ID</span>
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="block md:table-cell px-6 py-3 md:py-4 border-b border-gray-100 md:border-b-0">
                      <span className="md:hidden font-semibold text-xs text-gray-500 mr-2 uppercase block mb-1">Customer</span>
                      <p className="font-medium text-[var(--foreground)] inline-block md:block">{order.customer?.firstName} {order.customer?.lastName}</p>
                      <p className="text-xs text-[var(--text-muted)] inline-block md:block ml-2 md:ml-0">{order.customer?.email}</p>
                      <p className="text-xs text-[var(--text-muted)] inline-block md:block ml-2 md:ml-0">{order.customer?.phone}</p>
                      {order.shippingAddress && (
                        <p className="text-xs text-[var(--text-muted)] inline-block md:block ml-2 md:ml-0 mt-1">
                          {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.pinCode}
                        </p>
                      )}
                    </td>
                    <td className="block md:table-cell px-6 py-3 md:py-4 border-b border-gray-100 md:border-b-0">
                      <span className="md:hidden font-semibold text-xs text-gray-500 mr-2 uppercase block mb-1">Items</span>
                      <div className="space-y-1 inline-block md:block">
                        {order.items?.map((item, i) => (
                          <p key={i} className="text-xs text-[var(--text-muted)]">
                            {item.name} × {item.quantity} <span className="opacity-60">(Size: {item.size})</span>
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="block md:table-cell px-6 py-3 md:py-4 font-semibold text-[var(--foreground)] border-b border-gray-100 md:border-b-0">
                      <span className="md:hidden font-semibold text-xs text-gray-500 mr-2 uppercase">Total:</span>
                      ₹{order.financials?.total?.toLocaleString('en-IN')}
                    </td>
                    <td className="block md:table-cell px-6 py-3 md:py-4 border-b border-gray-100 md:border-b-0">
                      <span className="md:hidden font-semibold text-xs text-gray-500 mr-2 uppercase">Payment:</span>
                      <span className="text-xs font-medium uppercase bg-[var(--bg)] px-2 py-1 rounded inline-block md:block w-fit">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="block md:table-cell px-6 py-3 md:py-4 text-xs text-[var(--text-muted)] border-b border-gray-100 md:border-b-0">
                      <span className="md:hidden font-semibold text-xs text-gray-500 mr-2 uppercase">Date:</span>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="flex md:table-cell px-6 py-4 md:py-4 justify-between md:justify-start items-center bg-gray-50 md:bg-transparent">
                      <div className="flex items-center gap-3 w-full justify-between md:justify-start">
                        <div className="flex items-center gap-2">
                          <span className="md:hidden font-semibold text-xs text-gray-500 uppercase">Status:</span>
                          <div className="flex flex-col gap-2">
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              disabled={updatingId === order._id}
                              className={`text-xs font-bold px-3 py-1.5 rounded-md border-0 ring-1 ring-inset ring-black/5 focus:ring-2 focus:ring-[var(--accent)] outline-none cursor-pointer shadow-sm transition-all ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100'} disabled:opacity-50`}
                            >
                              <option value="Pending Delivery Quote" className="bg-white text-gray-900 py-1">Pending Delivery Quote</option>
                              <option value="Waiting for Customer Confirmation" className="bg-white text-gray-900 py-1">Waiting Confirmation</option>
                              <option value="Confirmed" className="bg-white text-gray-900 py-1">Confirmed</option>
                              <option value="Processing" className="bg-white text-gray-900 py-1">Processing</option>
                              <option value="Shipped" className="bg-white text-gray-900 py-1">Shipped</option>
                              <option value="Delivered" className="bg-white text-gray-900 py-1">Delivered</option>
                              <option value="Cancelled" className="bg-white text-gray-900 py-1">Cancelled</option>
                            </select>
                            
                            {order.orderStatus === 'Pending Delivery Quote' && (
                              <div className="flex items-center gap-1 mt-1 bg-white p-1 rounded border border-orange-200">
                                <span className="text-xs text-gray-500 font-medium pl-1">₹</span>
                                <input 
                                  type="number" 
                                  placeholder="Cost" 
                                  className="w-16 px-1 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-orange-400"
                                  value={deliveryQuotes[order._id] || ''}
                                  onChange={(e) => setDeliveryQuotes({...deliveryQuotes, [order._id]: e.target.value})}
                                />
                                <button 
                                  onClick={() => handleSendQuote(order._id)}
                                  disabled={updatingId === order._id}
                                  className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] uppercase tracking-wider font-bold rounded transition-colors"
                                >
                                  Send
                                </button>
                              </div>
                            )}
                            
                            {order.deliveryCharge !== null && order.deliveryCharge !== undefined && (
                               <div className="text-[10px] text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded inline-block mt-1">
                                 Delivery: ₹{order.deliveryCharge}
                               </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          disabled={updatingId === order._id}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Delete Order"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
