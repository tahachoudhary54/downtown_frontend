'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from '@/components/Pagination';
import { ITEMS_PER_PAGE } from '@/config/pagination';

function AdminProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sale, setSale] = useState('all');
  const [page, setPage] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=${ITEMS_PER_PAGE}`;
      if (search) query += `&search=${search}`;
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
  }, [token, page, search, sale]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts(); // refresh list
        router.refresh(); // purge Next.js router cache
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Products</h2>
        <Link 
          href="/admin/products/new"
          className="bg-[#F1ECE5] text-[var(--foreground)] px-5 py-2 rounded-lg font-medium hover:bg-[#E5DED5] transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          + Add New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--border)] flex flex-wrap gap-4">
        <input 
          type="text" 
          placeholder="Search products..." 
          className="flex-1 min-w-[150px] sm:min-w-[200px] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
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
                <th className="p-2 sm:p-4 font-semibold">Image</th>
                <th className="p-2 sm:p-4 font-semibold">Product</th>
                <th className="p-2 sm:p-4 font-semibold hidden sm:table-cell">Category</th>
                <th className="p-2 sm:p-4 font-semibold hidden md:table-cell">Sub Category</th>
                <th className="p-2 sm:p-4 font-semibold hidden lg:table-cell">Collection</th>
                <th className="p-2 sm:p-4 font-semibold hidden sm:table-cell">Price</th>
                <th className="p-2 sm:p-4 font-semibold hidden md:table-cell">Inventory Status</th>
                <th className="p-2 sm:p-4 font-semibold hidden md:table-cell">Visibility</th>
                <th className="p-2 sm:p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500 animate-pulse">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500">No products found.</td>
                </tr>
              ) : (
                products.map((product) => {
                  const hasVariants = product.variants && product.variants.length > 0;
                  const isLowStock = !hasVariants && product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
                  
                  return (
                  <tr key={product._id} className="border-b border-[var(--border)] hover:bg-[#FAF8F5] transition-colors">
                    <td className="p-2 sm:p-4">
                      <img src={product.img} alt={product.name} className="w-10 h-10 sm:w-12 sm:h-12 min-w-[40px] sm:min-w-[48px] object-cover rounded border border-[var(--border)]" />
                    </td>
                    <td className="p-2 sm:p-4">
                      <p className="font-medium text-[var(--foreground)] break-words line-clamp-2">{product.name}</p>
                      <div className="mt-1 flex flex-wrap gap-1 text-xs">
                        {product.isOnSale && <span className="bg-red-100 text-red-700 font-semibold px-1.5 py-0.5 rounded">Sale</span>}
                        {!product.inStock && <span className="bg-gray-100 text-gray-700 font-semibold px-1.5 py-0.5 rounded">Out of Stock</span>}
                        {isLowStock && <span className="bg-orange-100 text-orange-700 font-semibold px-1.5 py-0.5 rounded">Low Stock</span>}
                        {product.essentialCollection && <span className="bg-purple-100 text-purple-700 font-semibold px-1.5 py-0.5 rounded">Collection</span>}
                        {hasVariants && <span className="bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded">Variants</span>}
                      </div>
                      <div className="sm:hidden mt-1 flex flex-col gap-1 text-xs">
                        <span className="text-[var(--foreground)] font-semibold">
                          {String(product.price).startsWith('₹') ? product.price : `₹${product.price}`}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 text-[var(--text-muted)] capitalize hidden sm:table-cell">{product.category}</td>
                    <td className="p-2 sm:p-4 text-[var(--text-muted)] capitalize hidden md:table-cell">{product.subCategory || '-'}</td>
                    <td className="p-2 sm:p-4 text-[var(--text-muted)] capitalize hidden lg:table-cell">{product.essentialCollection || '-'}</td>
                    <td className="p-2 sm:p-4 text-[var(--foreground)] font-medium hidden sm:table-cell">
                      {String(product.price).startsWith('₹') ? product.price : `₹${product.price}`}
                      {product.isOnSale && <span className="ml-2 text-xs text-red-500 line-through">{String(product.originalPrice).startsWith('₹') ? product.originalPrice : `₹${product.originalPrice}`}</span>}
                    </td>
                    <td className="p-2 sm:p-4 hidden md:table-cell">
                      <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap inline-block ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {product.inStock ? (hasVariants ? 'Check Variants' : `${product.stock} in stock`) : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="p-2 sm:p-4 hidden md:table-cell">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${product.inStock ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                        {product.inStock ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-2 sm:p-4 text-right">
                      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                        <Link href={`/admin/products/edit/${product._id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-800 font-medium text-sm">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-white p-4">
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  return (
    <Suspense fallback={<div>Loading Products...</div>}>
      <AdminProductsContent />
    </Suspense>
  );
}
