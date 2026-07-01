'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import Link from 'next/link';

export default function AdminStock() {
  const { token } = useAdminAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        // Fetch all products to calculate accurate metrics (could be optimized with a dedicated stats endpoint later)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products?limit=1000`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAllProducts();
  }, [token]);

  // Calculate Metrics
  const totalProducts = products.length;
  let totalInventoryValue = 0;
  let totalItemsInStock = 0;
  
  const lowStockProducts = [];
  const outOfStockProducts = [];

  products.forEach(p => {
    const stock = p.stock || 0;
    const price = p.priceValue || 0;
    const threshold = p.lowStockThreshold || 5;
    
    totalItemsInStock += stock;
    totalInventoryValue += (stock * price);

    const hasVariants = p.variants && p.variants.length > 0;
    
    if (hasVariants) {
      if (stock === 0) {
        outOfStockProducts.push({ ...p, displayName: p.name, displayStock: 0, _uniqueId: p._id });
      } else {
        // If not fully out of stock, check individual variants
        p.variants.forEach(v => {
          if (v.sizeInventory && Object.keys(v.sizeInventory).length > 0) {
            Object.entries(v.sizeInventory).forEach(([sizeName, sizeStock]) => {
              if (sizeStock === 0) {
                outOfStockProducts.push({ ...p, displayName: `${p.name} - ${v.colorName} (Size ${sizeName})`, displayStock: 0, img: v.images?.[0] || p.img, _uniqueId: `${p._id}-${v.colorName}-${sizeName}` });
              } else if (sizeStock <= threshold) {
                lowStockProducts.push({ ...p, displayName: `${p.name} - ${v.colorName} (Size ${sizeName})`, displayStock: sizeStock, img: v.images?.[0] || p.img, _uniqueId: `${p._id}-${v.colorName}-${sizeName}` });
              }
            });
          } else {
            const vStock = v.stock || 0;
            if (vStock === 0) {
              outOfStockProducts.push({ ...p, displayName: `${p.name} - ${v.colorName}`, displayStock: 0, img: v.images?.[0] || p.img, _uniqueId: `${p._id}-${v.colorName}` });
            } else if (vStock <= threshold) {
              lowStockProducts.push({ ...p, displayName: `${p.name} - ${v.colorName}`, displayStock: vStock, img: v.images?.[0] || p.img, _uniqueId: `${p._id}-${v.colorName}` });
            }
          }
        });
      }
    } else {
      if (stock === 0) {
        outOfStockProducts.push({ ...p, displayName: p.name, displayStock: 0, _uniqueId: p._id });
      } else if (stock <= threshold) {
        lowStockProducts.push({ ...p, displayName: p.name, displayStock: stock, _uniqueId: p._id });
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Inventory Analytics</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">High-level overview of your product stock.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-[var(--border)]">
          <p className="text-sm text-gray-500 font-medium">Total Unique Products</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : totalProducts}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-[var(--border)]">
          <p className="text-sm text-gray-500 font-medium">Total Items in Stock</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : totalItemsInStock}</p>
        </div>
        <div className="bg-orange-50 p-5 rounded-xl shadow-sm border border-orange-100">
          <p className="text-sm text-orange-700 font-medium">Low Stock Alerts</p>
          <p className="text-3xl font-bold text-orange-900 mt-2">{loading ? '...' : lowStockProducts.length}</p>
        </div>
        <div className="bg-red-50 p-5 rounded-xl shadow-sm border border-red-100">
          <p className="text-sm text-red-700 font-medium">Out of Stock</p>
          <p className="text-3xl font-bold text-red-900 mt-2">{loading ? '...' : outOfStockProducts.length}</p>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
        <h3 className="text-lg font-bold text-blue-900">Estimated Inventory Value</h3>
        <p className="text-4xl font-bold text-blue-700 mt-2">
          {loading ? '...' : `₹${totalInventoryValue.toLocaleString()}`}
        </p>
        <p className="text-sm text-blue-600 mt-2">Based on current stock × product price.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Out of Stock List */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-red-50">
            <h3 className="font-bold text-red-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              Out of Stock Products ({outOfStockProducts.length})
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto p-4 space-y-3">
            {loading ? <p className="text-gray-500 text-sm">Loading...</p> : 
             outOfStockProducts.length === 0 ? <p className="text-gray-500 text-sm">All products are in stock.</p> :
             outOfStockProducts.map(p => (
              <div key={p._uniqueId || p._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <img src={p.img} alt={p.displayName || p.name} className="w-10 h-10 rounded object-cover border" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{p.displayName || p.name}</p>
                    <p className="text-xs text-gray-500">{p.sku || 'No SKU'}</p>
                  </div>
                </div>
                <Link href={`/admin/products/edit/${p._id}`} className="text-xs font-semibold text-blue-600 hover:underline">
                  Manage →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock List */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-orange-50">
            <h3 className="font-bold text-orange-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Low Stock Products ({lowStockProducts.length})
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto p-4 space-y-3">
            {loading ? <p className="text-gray-500 text-sm">Loading...</p> : 
             lowStockProducts.length === 0 ? <p className="text-gray-500 text-sm">No low stock products.</p> :
             lowStockProducts.map(p => (
              <div key={p._uniqueId || p._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <img src={p.img} alt={p.displayName || p.name} className="w-10 h-10 rounded object-cover border" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{p.displayName || p.name}</p>
                    <p className="text-xs font-semibold text-orange-600">{p.displayStock !== undefined ? p.displayStock : p.stock} left in stock</p>
                  </div>
                </div>
                <Link href={`/admin/products/edit/${p._id}`} className="text-xs font-semibold text-blue-600 hover:underline">
                  Restock →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
