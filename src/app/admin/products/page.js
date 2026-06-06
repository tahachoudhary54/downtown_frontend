'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sale, setSale] = useState('all');
  const [page, setPage] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=10`;
      if (search) query += `&search=${search}`;
      if (category) query += `&category=${category}`;
      if (sale !== 'all') query += `&sale=${sale}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProducts();
  }, [token, page, search, category, sale]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts(); // refresh
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Products</h2>
        <Link 
          href="/admin/products/new"
          className="bg-[var(--accent)] text-white px-5 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
        >
          + Add New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--border)] flex flex-wrap gap-4">
        <input 
          type="text" 
          placeholder="Search products..." 
          className="flex-1 min-w-[200px] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select 
          className="border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)] bg-white"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          <option value="clothing">Clothing</option>
          <option value="shoes">Shoes</option>
          <option value="accessories">Accessories</option>
        </select>
        <select 
          className="border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)] bg-white"
          value={sale}
          onChange={(e) => { setSale(e.target.value); setPage(1); }}
        >
          <option value="all">All Status</option>
          <option value="true">On Sale</option>
          <option value="false">Regular Price</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F9F7F4] text-[var(--text-muted)] border-b border-[var(--border)]">
              <tr>
                <th className="p-4 font-semibold">Image</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 animate-pulse">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No products found.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="border-b border-[var(--border)] hover:bg-[#FAF8F5] transition-colors">
                    <td className="p-4">
                      <img src={product.img} alt={product.name} className="w-12 h-12 object-cover rounded border border-[var(--border)]" />
                    </td>
                    <td className="p-4 font-medium text-[var(--foreground)]">{product.name}</td>
                    <td className="p-4 text-[var(--text-muted)] capitalize">{product.category}</td>
                    <td className="p-4 text-[var(--foreground)] font-medium">
                      ${product.price}
                      {product.isOnSale && <span className="ml-2 text-xs text-red-500 line-through">${product.originalPrice}</span>}
                    </td>
                    <td className="p-4">
                      {product.isOnSale && (
                        <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">Sale</span>
                      )}
                      {!product.inStock && (
                        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded ml-2">Out of Stock</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <Link href={`/admin/products/edit/${product._id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-800 font-medium">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[var(--border)] flex justify-between items-center">
            <span className="text-sm text-[var(--text-muted)]">
              Showing page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="space-x-2">
              <button 
                disabled={pagination.page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border border-[var(--border)] rounded text-sm disabled:opacity-50 hover:bg-[#F9F7F4]"
              >
                Previous
              </button>
              <button 
                disabled={pagination.page === pagination.totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border border-[var(--border)] rounded text-sm disabled:opacity-50 hover:bg-[#F9F7F4]"
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
