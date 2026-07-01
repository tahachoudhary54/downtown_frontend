'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';

export default function RequestDetails() {
  const { id } = useParams();
  const { token, user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const fetcher = (url) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());

  const { data, isLoading } = useSWR(
    token && id ? `${apiBase}/api/returns/myreturns/${id}` : null,
    fetcher
  );

  if (!mounted || loading || !user) return null;

  const req = data?.data;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="min-h-screen p-12 text-center text-[var(--text-muted)] animate-pulse">Loading request details...</div>;
  }

  if (!req) {
    return (
      <div className="min-h-screen p-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Request Not Found</h2>
        <Link href="/profile/returns" className="text-[var(--accent)] underline">Back to Returns</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/profile/returns" className="text-[var(--text-muted)] hover:text-[var(--foreground)] flex items-center gap-2 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Requests
          </Link>
          <div className="text-sm text-[var(--text-muted)]">
            Last updated: {new Date(req.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-[var(--border)] overflow-hidden">
          <div className="p-6 md:p-8 border-b border-[var(--border)] bg-[#FAF8F5] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">
                {req.requestType} Request
              </h1>
              <p className="text-[var(--text-muted)]">
                Order #{req.orderId}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${getStatusColor(req.status)}`}>
                Status: {req.status}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                Submitted on {new Date(req.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Reason</h3>
                <p className="text-lg font-medium text-[var(--foreground)]">{req.reason}</p>
              </div>
              
              {req.refundStatus && req.refundStatus !== 'Pending' && req.refundStatus !== 'Not Applicable' && (
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Refund Status</h3>
                  <p className="text-lg font-medium text-emerald-600">{req.refundStatus}</p>
                </div>
              )}
            </div>

            {req.message && (
              <div>
                <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Your Message</h3>
                <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[var(--border)] text-[var(--foreground)]">
                  {req.message}
                </div>
              </div>
            )}

            {req.adminRemarks && (
              <div>
                <h3 className="text-sm font-bold text-[var(--accent)] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  Admin Remarks
                </h3>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-900 shadow-sm">
                  {req.adminRemarks}
                </div>
              </div>
            )}

            {req.images && req.images.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Uploaded Images</h3>
                <div className="flex flex-wrap gap-4">
                  {req.images.map((img, idx) => (
                    <a key={idx} href={img} target="_blank" rel="noreferrer" className="block relative w-32 h-32 rounded-xl overflow-hidden border border-[var(--border)] hover:opacity-80 transition-opacity shadow-sm">
                      <img src={img} alt={`Upload ${idx+1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
