'use client';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { currentPage, totalPages, totalProducts, limit } = pagination;
  
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalProducts);

  const pages = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (endPage - startPage < 4) {
    if (startPage === 1) endPage = Math.min(totalPages, 5);
    else startPage = Math.max(1, totalPages - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handlePageChange = (page) => {
    if (page !== currentPage) {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col items-center mt-12 mb-8 gap-4 w-full">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="First page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>
        </button>
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="Previous page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        {startPage > 1 && (
          <span className="text-gray-400 px-1">...</span>
        )}

        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
              page === currentPage 
                ? 'bg-black text-white shadow-md' 
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-black'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <span className="text-gray-400 px-1">...</span>
        )}

        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="Next page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <button 
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="Last page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>
        </button>
      </div>
      <div className="text-sm text-gray-500 font-medium mt-2">
        Showing {startItem}–{endItem} of {totalProducts} Products
      </div>
    </div>
  );
}
