'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AdminReviewsPage() {
  const { token } = useAuth();
  
  // Analytics State
  const [analytics, setAnalytics] = useState(null);
  
  // Reviews List State
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reviews/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reviews/admin/all?page=${page}&status=${statusFilter}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
      fetchReviews(1);
    }
  }, [token, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reviews/admin/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchReviews(pagination.page);
        fetchAnalytics(); // refresh stats
      } else {
        alert(data.message || 'Error updating status');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reviews/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchReviews(pagination.page);
        fetchAnalytics();
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const exportCSV = () => {
    if (!reviews || reviews.length === 0) return alert('No data to export.');
    
    // Create CSV content
    const headers = ['ID', 'Date', 'Product', 'User', 'Rating', 'Status', 'Title', 'ReviewText', 'ReportCount'];
    const rows = reviews.map(r => [
      r._id,
      new Date(r.createdAt).toLocaleDateString(),
      r.product?.name ? `"${r.product.name.replace(/"/g, '""')}"` : 'Unknown',
      r.user?.name ? `"${r.user.name.replace(/"/g, '""')}"` : 'Unknown',
      r.rating,
      r.status,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.text.replace(/"/g, '""')}"`,
      r.reportCount
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reviews_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Analytics Dashboard */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Total Reviews</h4>
            <div className="text-3xl font-playfair font-bold">{analytics.totalReviews}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Overall Average</h4>
            <div className="text-3xl font-playfair font-bold text-[var(--accent)]">{analytics.overallAverageRating} / 5</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Pending Approval</h4>
            <div className="text-3xl font-playfair font-bold text-yellow-600">{analytics.pendingReviews}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Reported</h4>
            <div className="text-3xl font-playfair font-bold text-red-500">{analytics.reportedReviews}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[var(--border)] shadow-sm">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Approved</h4>
            <div className="text-3xl font-playfair font-bold text-green-600">{analytics.approvedReviews}</div>
          </div>
        </div>
      )}

      {/* Reviews Management */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        
        {/* Header / Toolbar */}
        <div className="p-6 border-b border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
          <div className="flex gap-2">
            {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${statusFilter === status ? 'bg-[var(--foreground)] text-white' : 'bg-white border border-[var(--border)] text-gray-600 hover:bg-gray-100'}`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchReviews(1)}
                className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-sm"
              />
              <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <button 
              onClick={exportCSV}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[var(--border)] text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Rating</th>
                <th className="p-4 font-medium min-w-[250px]">Review</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No reviews found matching criteria.</td>
                </tr>
              ) : (
                reviews.map(review => (
                  <tr key={review._id} className="hover:bg-gray-50 align-top">
                    <td className="p-4">
                      <div className="font-medium text-[var(--foreground)]">{review.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{review.user?.email}</div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {review.product?.img && (
                          <img src={review.product.img} className="w-10 h-10 object-cover rounded border" alt="" />
                        )}
                        <Link href={`/product/${review.product?._id}`} target="_blank" className="text-sm font-medium text-[var(--accent)] hover:underline line-clamp-2 max-w-[150px]">
                          {review.product?.name || 'Unknown Product'}
                        </Link>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex text-[#D4AF37] text-sm mb-1">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                      {review.isVerifiedPurchase && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Verified</span>}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-sm mb-1">{review.title}</div>
                      <div className="text-sm text-gray-600 line-clamp-3 mb-2">{review.text}</div>
                      {review.reportCount > 0 && (
                        <div className="text-xs text-red-500 font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                          Reported ({review.reportCount})
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <select
                        value={review.status}
                        onChange={(e) => handleStatusChange(review._id, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-3 py-1 border-0 cursor-pointer ${
                          review.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          review.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(review._id)}
                        className="text-red-500 hover:text-red-700 p-2 transition-colors"
                        title="Delete Review"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-[var(--border)] flex justify-between items-center bg-gray-50">
            <span className="text-sm text-gray-500">
              Showing page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => fetchReviews(pagination.page - 1)}
                className="px-3 py-1 bg-white border border-[var(--border)] rounded text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => fetchReviews(pagination.page + 1)}
                className="px-3 py-1 bg-white border border-[var(--border)] rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
