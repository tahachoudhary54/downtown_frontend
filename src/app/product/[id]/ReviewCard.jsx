'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ReviewCard({ review }) {
  const { token, user } = useAuth();
  const [helpfulVotes, setHelpfulVotes] = useState(review.helpfulVotes || 0);
  const [hasVoted, setHasVoted] = useState(review.helpfulBy?.includes(user?.id) || false);
  const [isVoting, setIsVoting] = useState(false);
  const [reported, setReported] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const handleHelpful = async () => {
    if (!user) return alert('Please login to vote.');
    if (isVoting) return;
    
    setIsVoting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reviews/${review._id}/helpful`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHelpfulVotes(data.helpfulVotes);
        setHasVoted(data.hasVoted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVoting(false);
    }
  };

  const handleReport = async () => {
    if (!user) return alert('Please login to report.');
    if (reported || isReporting) return;
    if (!confirm('Are you sure you want to report this review as inappropriate?')) return;
    
    setIsReporting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reviews/${review._id}/report`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReported(true);
        alert('Review reported. Our team will review it shortly.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReporting(false);
    }
  };

  // Generate stars
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{ color: i <= review.rating ? '#D4AF37' : '#e5e7eb' }} className="text-xl">
        ★
      </span>
    );
  }

  // Format date
  const dateStr = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="py-8 border-b border-[var(--border)] last:border-0">
      <div className="flex flex-col md:flex-row md:gap-8">
        {/* User Info Column */}
        <div className="md:w-1/4 mb-4 md:mb-0 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center font-playfair font-bold text-lg">
              {review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="font-medium text-[var(--foreground)]">{review.user?.name || 'Customer'}</p>
              {review.isVerifiedPurchase && (
                <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Verified Purchase
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Review Content Column */}
        <div className="md:w-3/4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-0.5">{stars}</div>
            <span className="text-sm text-[var(--text-muted)]">{dateStr}</span>
          </div>
          
          <h4 className="text-lg font-bold text-[var(--foreground)] mb-2 font-inter">{review.title}</h4>
          
          <p className="text-[var(--text-muted)] leading-relaxed mb-6 whitespace-pre-line">
            {review.text}
          </p>
          
          {review.images && review.images.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {review.images.map((img, idx) => (
                <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                  <img src={img} alt="Review attachment" className="w-24 h-24 object-cover rounded border border-[var(--border)]" />
                </a>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <button 
              onClick={handleHelpful}
              className={`text-sm flex items-center gap-1.5 transition-colors ${hasVoted ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
              Helpful ({helpfulVotes})
            </button>
            <button 
              onClick={handleReport}
              disabled={reported}
              className={`text-sm flex items-center gap-1.5 transition-colors ${reported ? 'text-orange-500' : 'text-[var(--text-muted)] hover:text-red-500'}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
              {reported ? 'Reported' : 'Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
