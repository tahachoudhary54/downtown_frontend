'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminTicketsPage() {
  const router = useRouter();
  const { token, user, loading } = useAdminAuth();
  const [filter, setFilter] = useState('All');

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const fetcher = (url) => fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

  const { data, error, mutate } = useSWR(
    user && token && user.role === 'admin' ? `${apiBase}/api/tickets` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      const res = await fetch(`${apiBase}/api/tickets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        mutate();
      } else {
        alert(result.message || 'Failed to delete ticket');
      }
    } catch (err) {
      alert('Network error while deleting ticket');
    }
  };

  const tickets = data?.data || [];

  const filteredTickets = filter === 'All' 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  if (!user && !loading) {
    return null;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Support Tickets</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage customer support requests and complaints</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full">
          {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-[var(--accent)] text-white' 
                  : 'bg-white border border-[var(--border)] text-[var(--text-muted)] hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="md:bg-white md:rounded-xl md:shadow-sm md:border md:border-[var(--border)] overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-muted)] bg-white rounded-xl shadow-sm border border-[var(--border)] md:border-0 md:rounded-none md:shadow-none">
            <p>No tickets found for the selected filter.</p>
          </div>
        ) : (
          <div>
            <table className="w-full text-left border-collapse block md:table">
              <thead className="hidden md:table-header-group">
                <tr className="bg-[#FAF8F5] border-b border-[var(--border)]">
                  <th className="p-4 text-sm font-semibold text-[var(--text-muted)]">TICKET ID</th>
                  <th className="p-4 text-sm font-semibold text-[var(--text-muted)]">CUSTOMER</th>
                  <th className="p-4 text-sm font-semibold text-[var(--text-muted)]">SUBJECT</th>
                  <th className="p-4 text-sm font-semibold text-[var(--text-muted)]">CATEGORY</th>
                  <th className="p-4 text-sm font-semibold text-[var(--text-muted)]">STATUS</th>
                  <th className="p-4 text-sm font-semibold text-[var(--text-muted)]">CREATED</th>
                  <th className="p-4 text-sm font-semibold text-[var(--text-muted)]">ACTION</th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group divide-y-0 md:divide-y md:divide-[var(--border)]">
                {filteredTickets.map(ticket => {
                  const isUnread = ticket.status === 'Open' && ticket.messages.length > 0 && ticket.messages[ticket.messages.length - 1].sender === 'customer';
                  
                  return (
                    <tr key={ticket._id} className={`bg-white rounded-xl shadow-sm border border-[var(--border)] mb-4 md:mb-0 md:rounded-none md:shadow-none md:border-0 hover:bg-gray-50 transition-colors block md:table-row overflow-hidden ${isUnread ? 'bg-[#fcf8e3]' : ''}`}>
                      <td className="block md:table-cell px-4 pt-4 pb-1.5 md:p-4 font-mono text-sm text-[var(--foreground)]">
                        <span className="md:hidden font-semibold text-xs text-gray-500 mr-2">ID:</span>
                        #{ticket._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="block md:table-cell px-4 py-1.5 md:p-4">
                        <span className="md:hidden font-semibold text-xs text-gray-500 mr-2 inline-block">Customer:</span>
                        <div className="font-medium text-[var(--foreground)] inline-block md:block">
                          {ticket.user?.name || ticket.guestName || 'Unknown User'}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] inline-block md:block ml-2 md:ml-0 break-all">
                          {ticket.user?.email || ticket.guestEmail || ''}
                        </div>
                      </td>
                      <td className="block md:table-cell px-4 py-1.5 md:p-4">
                        <span className="md:hidden font-semibold text-xs text-gray-500 mr-2 inline-block">Subject:</span>
                        <div className={`font-medium ${isUnread ? 'text-[var(--accent)] font-bold' : 'text-[var(--foreground)]'} inline-block md:block whitespace-normal break-all md:break-normal`}>
                          {ticket.subject.length > 30 ? ticket.subject.substring(0, 30) + '...' : ticket.subject}
                        </div>
                      </td>
                      <td className="block md:table-cell px-4 py-1.5 md:p-4 text-sm text-[var(--text-muted)]">
                        <span className="md:hidden font-semibold text-xs text-gray-500 mr-2">Category:</span>
                        {ticket.category}
                      </td>
                      <td className="flex md:table-cell px-4 py-1.5 md:p-4 items-center">
                        <span className="md:hidden font-semibold text-xs text-gray-500 mr-2">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap inline-block ${
                          ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="block md:table-cell px-4 py-1.5 md:p-4 text-sm text-[var(--text-muted)]">
                        <span className="md:hidden font-semibold text-xs text-gray-500 mr-2">Created:</span>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="flex md:table-cell px-4 pt-3 pb-4 md:p-4 items-center gap-4 mt-2 md:mt-0 bg-gray-50 md:bg-transparent border-t md:border-t-0 border-gray-100">
                        <button 
                          onClick={() => router.push(`/admin/tickets/${ticket._id}`)}
                          className="text-[var(--accent)] hover:underline text-sm font-medium text-left md:mr-4"
                        >
                          View & Reply
                        </button>
                        <button 
                          onClick={() => handleDelete(ticket._id)}
                          className="text-red-600 hover:underline text-sm font-medium text-left"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
