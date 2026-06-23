'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';

export default function AdminTicketDetailsPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const { token, user, loading } = useAuth();
  
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
  }, [user, loading, router]);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const fetcher = (url) => fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

  const { data, error, mutate } = useSWR(
    user && token && user.role === 'admin' ? `${apiBase}/api/tickets/${id}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const ticket = data?.data;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/api/tickets/${id}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: replyText })
      });
      const result = await res.json();
      if (result.success) {
        setReplyText('');
        mutate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === ticket.status) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`${apiBase}/api/tickets/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await res.json();
      if (result.success) {
        mutate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (!ticket && !error) {
    return <div className="p-12 text-center text-[var(--text-muted)] animate-pulse">Loading ticket details...</div>;
  }

  if (error || !ticket) {
    return <div className="p-12 text-center text-red-500 font-semibold">Ticket not found.</div>;
  }

  const ticketIdDisplay = ticket._id.slice(-6).toUpperCase();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button 
        onClick={() => router.push('/admin/tickets')} 
        className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors mb-6 flex items-center gap-2 font-medium"
      >
        &larr; Back to Tickets
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left Side: Ticket Metadata & Status */}
        <div className="w-full md:w-1/3 bg-[#FAF8F5] border-r border-[var(--border)] flex flex-col overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Ticket #{ticketIdDisplay}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase mb-1">Status</p>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdatingStatus}
                  className={`w-full p-2 rounded-lg font-semibold border ${
                    ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'bg-green-50 border-green-200 text-green-800' :
                    ticket.status === 'In Progress' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                    'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase mb-1">Category</p>
                <p className="text-sm font-medium text-[var(--foreground)]">{ticket.category}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase mb-1">Subject</p>
                <p className="text-sm font-medium text-[var(--foreground)]">{ticket.subject}</p>
              </div>

              {ticket.orderId && (
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase mb-1">Order Reference</p>
                  <button 
                    onClick={() => router.push(`/admin/orders/${ticket.orderId}`)}
                    className="text-sm font-medium text-[var(--accent)] hover:underline"
                  >
                    {ticket.orderId}
                  </button>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase mb-1">Customer</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                    {ticket.user?.name ? ticket.user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)] leading-tight">{ticket.user?.name || 'Unknown User'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{ticket.user?.email}</p>
                  </div>
                </div>
              </div>

              {ticket.attachments && ticket.attachments.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase mb-2">Attachment</p>
                  <a href={ticket.attachments[0]} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={ticket.attachments[0]} 
                      alt="Attachment" 
                      className="w-full rounded-lg border border-[var(--border)] cursor-pointer hover:opacity-90 transition-opacity" 
                    />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Chat Area */}
        <div className="w-full md:w-2/3 flex flex-col bg-white">
          <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[600px]">
            {ticket.messages.map((msg, idx) => {
              const isAdmin = msg.sender === 'admin';
              return (
                <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[80%]">
                    <div className={`flex items-center gap-2 mb-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs font-semibold text-[var(--text-muted)]">
                        {isAdmin ? 'You' : ticket.user?.name?.split(' ')[0] || 'Customer'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm ${
                      isAdmin 
                        ? 'bg-[#111] text-white rounded-tr-sm' 
                        : 'bg-[#FAF8F5] border border-[var(--border)] text-[var(--foreground)] rounded-tl-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-[var(--border)] bg-gray-50">
            <form onSubmit={handleReply} className="flex gap-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply to the customer..."
                className="flex-1 p-3 rounded-xl border border-[var(--border)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent text-sm"
                rows="2"
                required
              />
              <button 
                type="submit"
                disabled={isSubmitting || !replyText.trim()}
                className={`px-6 rounded-xl font-bold transition-colors ${
                  (isSubmitting || !replyText.trim())
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#111] text-white hover:bg-[#333]'
                }`}
              >
                Send
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
