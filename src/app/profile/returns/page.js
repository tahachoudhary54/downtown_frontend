'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import PageHero from '@/components/PageHero';

export default function MyReturns() {
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
    token ? `${apiBase}/api/returns/myreturns` : null,
    fetcher
  );

  if (!mounted || loading || !user) return null;

  const requests = data?.data || [];

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

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <PageHero 
        title="Return & Exchange Requests" 
        subtitle="Track the status of your return and exchange requests."
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center text-[var(--text-muted)] animate-pulse p-8">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">No Requests Found</h3>
            <p className="text-[var(--text-muted)] mb-6">You haven't made any return or exchange requests yet.</p>
            <Link href="/orders" className="inline-block bg-[var(--foreground)] font-bold tracking-wider uppercase px-8 py-3 rounded-xl hover:bg-[var(--accent)] transition-colors" style={{ color: '#ffffff' }}>
              View My Orders
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map(req => (
              <Link href={`/profile/returns/${req._id}`} key={req._id} className="block bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-[var(--foreground)]">Order #{req.orderId}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">
                        Requested on {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center justify-center bg-[#FAF8F5] border border-[var(--border)] rounded-lg px-4 py-2 font-semibold text-sm">
                        {req.requestType}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center text-sm">
                    <div>
                      <span className="text-[var(--text-muted)]">Reason: </span>
                      <span className="font-medium">{req.reason}</span>
                    </div>
                    <div className="text-[var(--accent)] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      View Details
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
