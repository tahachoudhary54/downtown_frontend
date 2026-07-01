'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminReturns() {
  const { token } = useAdminAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const [editStatus, setEditStatus] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [refundStatus, setRefundStatus] = useState('');

  const fetchRequests = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/returns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error('Error fetching returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/returns/${selectedRequest._id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: editStatus, adminRemarks, internalNotes, refundStatus })
      });
      const data = await res.json();
      if (data.success) {
        setRequests(prev => prev.map(req => req._id === selectedRequest._id ? data.data : req));
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error('Error updating request:', err);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[var(--text-muted)] animate-pulse">Loading Return Requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Return & Exchange Requests</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#FAF8F5] text-[var(--text-muted)] uppercase tracking-wider text-xs border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Reason</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-[var(--text-muted)]">No requests found.</td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{req.orderId}</td>
                    <td className="px-6 py-4">{req.name}</td>
                    <td className="px-6 py-4 font-semibold">{req.requestType}</td>
                    <td className="px-6 py-4">{req.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => {
                          setSelectedRequest(req);
                          setEditStatus(req.status);
                          setAdminRemarks(req.adminRemarks || '');
                          setInternalNotes(req.internalNotes || '');
                          setRefundStatus(req.refundStatus || 'Pending');
                        }}
                        className="text-[var(--accent)] hover:underline font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="flex justify-between items-center p-6 border-b border-[var(--border)] bg-[#FAF8F5]">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Request Details</h2>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-[var(--text-muted)] font-medium">Order ID</p>
                  <p className="text-lg font-semibold">{selectedRequest.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)] font-medium">Current Status</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)] font-medium">Customer Name</p>
                  <p className="text-md font-medium">{selectedRequest.name}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)] font-medium">Contact Info</p>
                  <p className="text-md">{selectedRequest.email}</p>
                  <p className="text-md">{selectedRequest.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)] font-medium">Type</p>
                  <p className="text-md font-medium">{selectedRequest.requestType}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)] font-medium">Reason</p>
                  <p className="text-md">{selectedRequest.reason}</p>
                </div>
              </div>

              {selectedRequest.message && (
                <div>
                  <p className="text-sm text-[var(--text-muted)] font-medium mb-1">Customer Message</p>
                  <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[var(--border)] text-sm">
                    {selectedRequest.message}
                  </div>
                </div>
              )}

              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div>
                  <p className="text-sm text-[var(--text-muted)] font-medium mb-3">Uploaded Images</p>
                  <div className="flex flex-wrap gap-4">
                    {selectedRequest.images.map((img, idx) => (
                      <a key={idx} href={img} target="_blank" rel="noreferrer" className="block relative w-24 h-24 rounded-lg overflow-hidden border border-[var(--border)] hover:opacity-80 transition-opacity">
                        <img src={img} alt={`Upload ${idx+1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-[var(--border)] pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--foreground)]">Update Status</label>
                  <select 
                    value={editStatus} 
                    onChange={e => setEditStatus(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[var(--border)] rounded-xl px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--foreground)]">Refund Status</label>
                  <select 
                    value={refundStatus} 
                    onChange={e => setRefundStatus(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[var(--border)] rounded-xl px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processed">Processed</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]">Admin Remarks (Visible to Customer)</label>
                <textarea 
                  value={adminRemarks} 
                  onChange={e => setAdminRemarks(e.target.value)}
                  rows="2"
                  className="w-full bg-[#FAF8F5] border border-[var(--border)] rounded-xl px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
                  placeholder="Leave a message for the customer..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-red-600">Internal Notes (Admin Only)</label>
                <textarea 
                  value={internalNotes} 
                  onChange={e => setInternalNotes(e.target.value)}
                  rows="2"
                  className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-2 focus:outline-none focus:border-red-400"
                  placeholder="Private notes..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="submit"
                  className="px-6 py-2 bg-[var(--foreground)] text-white rounded-lg font-medium hover:bg-[var(--accent)] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
            
          </div>
        </div>
      )}
    </div>
  );
}
