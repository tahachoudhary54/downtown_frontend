'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminStock() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [stockFilter, setStockFilter] = useState('all');

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // Edit Modal State
  const [editProduct, setEditProduct] = useState(null);
  const [editInventory, setEditInventory] = useState({ S: 0, M: 0, L: 0, XL: 0, XXL: 0, '3XL': 0 });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Use a limit of 10 to match the products page pagination
      let query = `?page=${page}&limit=10`;
      if (search) query += `&search=${search}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setPagination(data.pagination);
        setSelectedIds([]); // Clear selections on page change
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProducts();
  }, [token, page, search]);

  const toggleVisibility = async (id, currentStatus) => {
    try {
      setProducts(prev => prev.map(p => p._id === id ? { ...p, inStock: !currentStatus } : p));
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ inStock: !currentStatus })
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        setProducts(prev => prev.map(p => p._id === id ? { ...p, inStock: currentStatus } : p));
      }
    } catch (err) {
      console.error(err);
      setProducts(prev => prev.map(p => p._id === id ? { ...p, inStock: currentStatus } : p));
    }
  };

  // Bulk Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map(p => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // Bulk Actions
  const handleBulkMarkOutOfStock = async () => {
    if (!confirm(`Are you sure you want to mark ${selectedIds.length} items as Out of Stock?`)) return;
    setIsProcessingBulk(true);
    try {
      await Promise.all(selectedIds.map(id => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ stock: 0, inventory: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, '3XL': 0 } })
        })
      ));
      await fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Error updating bulk stock.');
    }
    setIsProcessingBulk(false);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length} items?`)) return;
    setIsProcessingBulk(true);
    try {
      await Promise.all(selectedIds.map(id => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
      await fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Error deleting products.');
    }
    setIsProcessingBulk(false);
  };

  // Edit Modal Handlers
  const openEditModal = (product) => {
    setEditProduct(product);
    // Initialize with existing inventory or defaults
    const currentInventory = product.inventory || {};
    setEditInventory({
      S: currentInventory.S || 0,
      M: currentInventory.M || 0,
      L: currentInventory.L || 0,
      XL: currentInventory.XL || 0,
      XXL: currentInventory.XXL || 0,
      '3XL': currentInventory['3XL'] || 0,
    });
  };

  const closeEditModal = () => {
    setEditProduct(null);
  };

  const handleInventoryChange = (size, value) => {
    const val = parseInt(value) || 0;
    setEditInventory(prev => ({ ...prev, [size]: Math.max(0, val) }));
  };

  const saveInventory = async () => {
    if (!editProduct) return;
    // Calculate total stock
    const stock = Object.values(editInventory).reduce((sum, val) => sum + val, 0);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${editProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ inventory: editInventory, stock })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p._id === editProduct._id ? { ...p, inventory: editInventory, stock } : p));
        closeEditModal();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save inventory.');
    }
  };

  // Status Badge Logic
  const getStockStatus = (total) => {
    if (total === undefined || total === null) total = 0;
    if (total > 10) return { label: 'In Stock', color: 'bg-green-100 text-green-800 border-green-200' };
    if (total > 0 && total <= 10) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { label: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  const filteredProducts = products.filter(p => {
    const total = p.stock || 0;
    if (stockFilter === 'all') return true;
    if (stockFilter === 'instock') return total > 10;
    if (stockFilter === 'lowstock') return total > 0 && total <= 10;
    if (stockFilter === 'outstock') return total === 0;
    return true;
  });

  // Calculate Summaries
  const totalProducts = products.length;
  const inStockCount = products.filter(p => (p.stock || 0) > 10).length;
  const lowStockCount = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length;
  const outOfStockCount = products.filter(p => (p.stock || 0) === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Stock Management</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--border)]">
          <p className="text-sm text-gray-500 font-medium">Total Products</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalProducts}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
          <p className="text-sm text-green-700 font-medium">In Stock (&gt;10)</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{inStockCount}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl shadow-sm border border-orange-100">
          <p className="text-sm text-orange-700 font-medium">Low Stock (1-10)</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{lowStockCount}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-100">
          <p className="text-sm text-red-700 font-medium">Out of Stock (0)</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{outOfStockCount}</p>
        </div>
      </div>

      {/* Filters and Bulk Actions Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--border)] flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 flex-1">
          <input 
            type="text" 
            placeholder="Search Name, Category, or SKU..." 
            className="flex-1 min-w-[250px] border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select 
            className="border border-[var(--border)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent)] bg-white"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="all">All Items</option>
            <option value="instock">In Stock</option>
            <option value="lowstock">Low Stock</option>
            <option value="outstock">Out of Stock</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <span className="text-sm font-semibold text-gray-700">{selectedIds.length} selected</span>
            <button 
              onClick={handleBulkMarkOutOfStock}
              disabled={isProcessingBulk}
              className="text-xs font-semibold bg-white text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
            >
              Mark Out of Stock
            </button>
            <button 
              onClick={handleBulkDelete}
              disabled={isProcessingBulk}
              className="text-xs font-semibold bg-white text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F9F7F4] text-[var(--text-muted)] border-b border-[var(--border)]">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
                    onChange={handleSelectAll}
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                  />
                </th>
                <th className="p-4 font-semibold w-16">Image</th>
                <th className="p-4 font-semibold">Product Details</th>
                <th className="p-4 font-semibold">SKU</th>
                <th className="p-4 font-semibold text-center">Stock Quantity</th>
                <th className="p-4 font-semibold text-center">Inventory Status</th>
                <th className="p-4 font-semibold text-center">Active/Inactive</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500 animate-pulse">Loading inventory data...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">No products match your criteria.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const total = product.stock || 0;
                  const status = getStockStatus(total);
                  
                  return (
                    <tr key={product._id} className={`border-b border-[var(--border)] transition-colors ${total === 0 ? 'bg-red-50/20' : 'hover:bg-[#FAF8F5]'}`}>
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
                          checked={selectedIds.includes(product._id)}
                          onChange={(e) => handleSelectOne(e, product._id)}
                        />
                      </td>
                      <td className="p-4">
                        <img src={product.img} alt={product.name} className="w-12 h-12 object-cover rounded border border-[var(--border)] shadow-sm" />
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-[var(--foreground)]">{product.name}</p>
                        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">{product.category}</p>
                      </td>
                      <td className="p-4 font-mono text-xs text-gray-500">
                        {product.sku || 'N/A'}
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold text-lg">{total}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button 
                            onClick={() => toggleVisibility(product._id, product.inStock)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${product.inStock ? 'bg-[var(--accent)]' : 'bg-gray-200'}`}
                            role="switch"
                            aria-checked={product.inStock}
                          >
                            <span 
                              aria-hidden="true" 
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${product.inStock ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                          </button>
                          <span className="text-[10px] text-gray-500 uppercase font-semibold">
                            {product.inStock ? 'Visible' : 'Hidden'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1.5 rounded border border-gray-300 transition-colors"
                        >
                          Edit Stock
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
            <span className="text-sm text-[var(--text-muted)]">
              Showing page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="space-x-2">
              <button 
                disabled={pagination.page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-white border border-[var(--border)] rounded text-sm disabled:opacity-50 hover:bg-[#F9F7F4] shadow-sm transition-colors"
              >
                Previous
              </button>
              <button 
                disabled={pagination.page === pagination.totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-white border border-[var(--border)] rounded text-sm disabled:opacity-50 hover:bg-[#F9F7F4] shadow-sm transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Stock Modal */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#FAF8F5] p-5 border-b border-[var(--border)] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-[var(--foreground)]">Edit Inventory</h3>
                <p className="text-sm text-gray-500">{editProduct.name}</p>
              </div>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 text-2xl font-light leading-none">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {['S', 'M', 'L', 'XL', 'XXL', '3XL'].map(size => (
                  <div key={size} className="flex flex-col">
                    <label className="text-xs font-bold text-gray-500 mb-1">Size {size}</label>
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => handleInventoryChange(size, editInventory[size] - 1)}
                        className="bg-gray-100 px-3 py-2 hover:bg-gray-200 text-gray-600 font-bold transition-colors"
                      >−</button>
                      <input 
                        type="number" 
                        className="w-full text-center py-2 focus:outline-none focus:bg-yellow-50 font-medium"
                        value={editInventory[size]}
                        onChange={(e) => handleInventoryChange(size, e.target.value)}
                        min="0"
                      />
                      <button 
                        onClick={() => handleInventoryChange(size, editInventory[size] + 1)}
                        className="bg-gray-100 px-3 py-2 hover:bg-gray-200 text-gray-600 font-bold transition-colors"
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total Calculated Stock:</span>
                <span className="text-2xl font-bold text-[var(--accent)]">
                  {Object.values(editInventory).reduce((sum, val) => sum + val, 0)}
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-[var(--border)] flex justify-end gap-3">
              <button 
                onClick={closeEditModal}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveInventory}
                className="px-6 py-2 bg-[var(--foreground)] text-white rounded-lg font-semibold hover:bg-black transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
