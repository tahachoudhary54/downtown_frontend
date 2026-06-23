'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import styles from './product.module.css';

export default function ReviewsSection({ product }) {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  
  // Filters & Sort
  const [sort, setSort] = useState('recent'); // recent, highest, lowest, helpful
  const [ratingFilter, setRatingFilter] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hasImages, setHasImages] = useState(false);
  
  const [showForm, setShowForm] = useState(false);

  // Distribution derived from product model
  const averageRating = product.averageRating || 0;
  const reviewCount = product.reviewCount || 0;
  const distribution = product.ratingDistribution || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

  useEffect(() => {
    fetchReviews();
  }, [product._id, pagination.page, sort, ratingFilter, verifiedOnly, hasImages]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reviews/product/${product._id}?page=${pagination.page}&sort=${sort}`;
      if (ratingFilter) url += `&rating=${ratingFilter}`;
      if (verifiedOnly) url += `&verifiedOnly=true`;
      if (hasImages) url += `&hasImages=true`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = (newReview) => {
    setShowForm(false);
    // Ideally, we refresh the product stats here by calling a prop function, 
    // but for now we just refresh the review list and they can refresh the page to see aggregate updates.
    fetchReviews();
    alert('Thank you! Your review has been submitted.');
  };

  const calculatePercentage = (count) => {
    if (!reviewCount) return 0;
    return Math.round((count / reviewCount) * 100);
  };

  return (
    <section className="mt-20 pt-16 border-t border-[var(--border)] max-w-[1200px] mx-auto px-4 md:px-8">
      <div className="flex flex-col items-center justify-center text-center mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-playfair tracking-wide text-[var(--foreground)] mb-2">Customer Reviews</h2>
          <p className="text-[var(--text-muted)] font-inter">{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'} for {product.name}</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-[var(--foreground)] text-[var(--background)] px-8 py-3 rounded uppercase tracking-wider font-medium text-sm hover:bg-opacity-90 transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <ReviewForm 
            productId={product._id} 
            onSuccess={handleReviewSubmitted} 
            onCancel={() => setShowForm(false)} 
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-12 mt-12">
        
        {/* Left Column: Summary */}
        <div className="lg:w-1/3">
          <div className="bg-[#fafafa] p-8 rounded-xl border border-[var(--border)] sticky top-24">
            <div className="text-center mb-8 pb-8 border-b border-[var(--border)]">
              <div className="text-6xl font-playfair mb-3 text-[var(--foreground)]">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center gap-1 mb-2 text-2xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} style={{ color: star <= Math.round(averageRating) ? '#D4AF37' : '#e5e7eb' }}>★</span>
                ))}
              </div>
              <div className="text-sm text-[var(--text-muted)] font-medium uppercase tracking-wider">Based on {reviewCount} Reviews</div>
            </div>

            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star.toString()] || 0;
                const percentage = calculatePercentage(count);
                return (
                  <div key={star} className="flex items-center gap-4 text-sm font-medium cursor-pointer group" onClick={() => setRatingFilter(ratingFilter === star ? '' : star)}>
                    <div className="w-12 text-[var(--text-muted)] group-hover:text-[var(--foreground)] transition-colors">{star} Stars</div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${ratingFilter === star ? 'bg-[var(--foreground)]' : 'bg-[#D4AF37]'}`}
                      />
                    </div>
                    <div className="w-8 text-right text-[var(--text-muted)] group-hover:text-[var(--foreground)] transition-colors">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Reviews List */}
        <div className="lg:w-2/3">
          
          {/* Controls */}
          {reviewCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
                  <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="accent-[var(--accent)]" />
                  Verified Only
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
                  <input type="checkbox" checked={hasImages} onChange={(e) => setHasImages(e.target.checked)} className="accent-[var(--accent)]" />
                  With Images
                </label>
                {ratingFilter && (
                  <button onClick={() => setRatingFilter('')} className="text-sm text-red-500 hover:text-red-700 ml-2">
                    Clear Star Filter
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-muted)]">Sort by:</span>
                <select 
                  value={sort} 
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium focus:outline-none cursor-pointer text-[var(--foreground)]"
                >
                  <option value="recent">Most Recent</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>
            </div>
          )}

          {/* List */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="space-y-8 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-6 pb-8 border-b border-gray-100">
                    <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
                    <div className="flex-1 space-y-4">
                      <div className="h-4 bg-gray-200 w-1/4 rounded"></div>
                      <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 w-full rounded"></div>
                        <div className="h-3 bg-gray-200 w-full rounded"></div>
                        <div className="h-3 bg-gray-200 w-3/4 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } }
                }}
              >
                {reviews.map((review) => (
                  <motion.div
                    key={review._id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <ReviewCard review={review} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-16 bg-[#fafafa] rounded-xl border border-[var(--border)]">
                <h3 className="text-xl font-playfair mb-2 text-[var(--foreground)]">No reviews found</h3>
                <p className="text-[var(--text-muted)]">
                  {reviewCount === 0 ? "Be the first to review this product!" : "Try adjusting your filters to see more reviews."}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <button 
                disabled={pagination.page === 1}
                onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                className="px-4 py-2 border border-[var(--border)] rounded disabled:opacity-50 text-sm hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPagination({...pagination, page: p})}
                  className={`w-10 h-10 rounded text-sm transition-colors ${p === pagination.page ? 'bg-[var(--foreground)] text-[var(--background)]' : 'border border-[var(--border)] hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              ))}
              <button 
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                className="px-4 py-2 border border-[var(--border)] rounded disabled:opacity-50 text-sm hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
