'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';

export default function AdminTicketsPage() {
  const router = useRouter();
  const { token, user, loading } = useAuth();
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
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Support Tickets</h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage customer support requests and complaints</p>
        </div>
        <div className="flex gap-2">
          {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

      <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-muted)]">
            <p>No tickets found for the selected filter.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
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
            <tbody className="divide-y divide-[var(--border)]">
              {filteredTickets.map(ticket => {
                const isUnread = ticket.status === 'Open' && ticket.messages.length > 0 && ticket.messages[ticket.messages.length - 1].sender === 'customer';
                
                return (
                  <tr key={ticket._id} className={`hover:bg-gray-50 transition-colors ${isUnread ? 'bg-[#fcf8e3]' : ''}`}>
                    <td className="p-4 font-mono text-sm text-[var(--foreground)]">#{ticket._id.slice(-6).toUpperCase()}</td>
                    <td className="p-4">
                      <div className="font-medium text-[var(--foreground)]">{ticket.user?.name || 'Unknown User'}</div>
                      <div className="text-xs text-[var(--text-muted)]">{ticket.user?.email}</div>
                    </td>
                    <td className="p-4">
                      <div className={`font-medium ${isUnread ? 'text-[var(--accent)] font-bold' : 'text-[var(--foreground)]'}`}>
                        {ticket.subject.length > 30 ? ticket.subject.substring(0, 30) + '...' : ticket.subject}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-muted)]">{ticket.category}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'bg-green-100 text-green-800' :
                        ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-muted)]">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 flex flex-col items-start gap-2">
                      <button 
                        onClick={() => router.push(`/admin/tickets/${ticket._id}`)}
                        className="text-[var(--accent)] hover:underline text-sm font-medium text-left"
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
        )}
      </div>
    </div>
  );
}
