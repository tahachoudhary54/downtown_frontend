'use client';

export default function AdminOrders() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Orders</h2>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-[var(--border)] text-center">
        <div className="mb-4 text-[var(--text-muted)]">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-lg font-medium">Orders Management</p>
          <p className="text-sm mt-2">This page is currently under construction. Order tracking and management features will be available here soon.</p>
        </div>
      </div>
    </div>
  );
}
