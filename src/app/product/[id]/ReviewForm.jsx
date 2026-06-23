'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import styles from './product.module.css';

export default function ReviewForm({ productId, onSuccess, onCancel }) {
  const { token, user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  
  const handleImageUpload = async (e) => {
    if (!e.target.files.length) return;
    if (images.length + e.target.files.length > 5) {
      setError("Maximum 5 images allowed.");
      return;
    }
    
    setUploading(true);
    setError('');
    
    const newImages = [];
    for (let file of e.target.files) {
      const data = new FormData();
      data.append('image', file);
      
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
          body: data
        });
        const result = await res.json();
        if (result.success) {
          newImages.push(result.imageUrl || result.url);
        }
      } catch (err) {
        console.error('Upload error', err);
      }
    }
    
    setImages([...images, ...newImages]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (!title.trim() || !text.trim()) {
      setError('Please provide a title and detailed review.');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product: productId,
          rating,
          title,
          text,
          images
        })
      });
      
      const data = await res.json();
      if (data.success) {
        onSuccess(data.data);
      } else {
        setError(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!user) {
    return (
      <div className="p-8 text-center bg-[#fafafa] border border-[var(--border)] rounded-lg">
        <h3 className="text-xl font-playfair mb-2">Sign in to Review</h3>
        <p className="text-[var(--text-muted)] mb-4">You must be logged in and have purchased this item to write a review.</p>
      </div>
    );
  }
  
  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 md:p-8 bg-[#fafafa] border border-[var(--border)] rounded-xl mt-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <h3 className="text-2xl font-playfair mb-6 tracking-wide text-[var(--foreground)]">Write a Review</h3>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text-muted)] mb-3">Overall Rating *</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="text-3xl focus:outline-none transition-transform hover:scale-110"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <span style={{ color: (hoverRating || rating) >= star ? '#D4AF37' : '#e5e7eb' }}>★</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Review Title *</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your experience"
          className="w-full px-4 py-3 bg-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] transition-colors"
          required
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Detailed Review *</label>
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did you like or dislike? How was the fit and quality?"
          rows={5}
          className="w-full px-4 py-3 bg-white border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
          required
        />
      </div>
      
      <div className="mb-8">
        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Add Photos (Optional, up to 5)</label>
        <div className="flex flex-wrap gap-4 mt-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img src={img} alt={`Upload ${idx+1}`} className="w-20 h-20 object-cover rounded-lg border border-[var(--border)]" />
              <button 
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute -top-2 -right-2 bg-black text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
          
          {images.length < 5 && (
            <label className="w-20 h-20 flex flex-col items-center justify-center bg-white border border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-[var(--accent)] hover:bg-gray-50 transition-colors">
              <span className="text-gray-400 text-2xl">+</span>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                className="hidden" 
                onChange={handleImageUpload}
                ref={fileInputRef}
                disabled={uploading}
              />
            </label>
          )}
        </div>
        {uploading && <p className="text-sm text-[var(--text-muted)] mt-2 animate-pulse">Uploading images...</p>}
      </div>
      
      <div className="flex gap-4">
        <button 
          type="submit" 
          disabled={submitting || uploading}
          className="flex-1 bg-[var(--foreground)] text-[var(--background)] px-6 py-4 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-70 uppercase tracking-wider"
        >
          {submitting ? 'Submitting...' : 'Post Review'}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          className="px-8 py-4 bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-lg font-medium hover:bg-gray-50 transition-colors uppercase tracking-wider"
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
}
