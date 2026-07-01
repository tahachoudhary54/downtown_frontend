'use client';

import { useState, useEffect } from 'react';
import PageHero from '@/components/PageHero';
import { useAuth } from '@/context/AuthContext';

export default function ReturnExchangeRequest() {
  const { user } = useAuth();
  const [isPreFilled, setIsPreFilled] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    name: '',
    email: '',
    phone: '',
    requestType: 'Return',
    reason: 'Wrong Size',
    message: '',
    confirmTags: false
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const orderId = searchParams.get('orderId');
    if (orderId && user) {
      setFormData(prev => ({
        ...prev,
        orderId: orderId,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
      setIsPreFilled(true);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      setErrorMsg("Maximum 5 images allowed");
      return;
    }
    setErrorMsg('');

    setImages(prev => [...prev, ...files].slice(0, 5));
    
    // Generate previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]); // cleanup
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const uploadImagesToBackend = async () => {
    const uploadedUrls = [];
    for (const image of images) {
      const formData = new FormData();
      formData.append('image', image);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          uploadedUrls.push(data.url || data.imageUrl || data.path); 
        }
      } catch (err) {
        console.error("Failed to upload image", err);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.confirmTags) {
      setErrorMsg("You must confirm the product condition before submitting.");
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      // 1. Upload Images sequentially
      let uploadedImageUrls = [];
      if (images.length > 0) {
        uploadedImageUrls = await uploadImagesToBackend();
      }

      // 2. Submit form data
      const payload = {
        ...formData,
        images: uploadedImageUrls.filter(Boolean)
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg("Your Return/Exchange Request has been submitted successfully. Our support team will contact you soon.");
        setFormData({
          orderId: '',
          name: '',
          email: '',
          phone: '',
          requestType: 'Return',
          reason: 'Wrong Size',
          message: '',
          confirmTags: false
        });
        setImages([]);
        setImagePreviews([]);
      } else {
        setErrorMsg(data.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <PageHero 
        title="Return & Exchange Request" 
        subtitle="If you have received a damaged, defective, or incorrect product, or would like to request an exchange, please complete the form below. Our team will review your request and contact you shortly."
      />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-[var(--border)] p-6 md:p-10">
          
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl flex items-center gap-3">
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-3">
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]">Order ID <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  required 
                  className={`w-full bg-[#FAF8F5] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors ${isPreFilled ? 'opacity-70 cursor-not-allowed' : ''}`}
                  readOnly={isPreFilled}
                  placeholder="e.g. ORD-12345"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]">Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                  className={`w-full bg-[#FAF8F5] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors ${isPreFilled ? 'opacity-70 cursor-not-allowed' : ''}`}
                  readOnly={isPreFilled}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]">Email Address <span className="text-red-500">*</span></label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                  className={`w-full bg-[#FAF8F5] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors ${isPreFilled ? 'opacity-70 cursor-not-allowed' : ''}`}
                  readOnly={isPreFilled}
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]">Phone Number <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required 
                  className={`w-full bg-[#FAF8F5] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors ${isPreFilled ? 'opacity-70 cursor-not-allowed' : ''}`}
                  readOnly={isPreFilled}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]">Request Type <span className="text-red-500">*</span></label>
                <select 
                  name="requestType"
                  value={formData.requestType}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#FAF8F5] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23666\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
                >
                  <option value="Return">Return</option>
                  <option value="Exchange">Exchange</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[var(--foreground)]">Reason <span className="text-red-500">*</span></label>
                <select 
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#FAF8F5] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23666\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
                >
                  <option value="Wrong Size">Wrong Size</option>
                  <option value="Damaged Product">Damaged Product</option>
                  <option value="Wrong Product Received">Wrong Product Received</option>
                  <option value="Quality Issue">Quality Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--foreground)]">Message / Additional Details</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="4"
                className="w-full bg-[#FAF8F5] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                placeholder="Please provide any additional context..."
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--foreground)] flex justify-between">
                <span>Upload Images</span>
                <span className="text-[var(--text-muted)] font-normal text-xs">{images.length} / 5</span>
              </label>
              <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center hover:bg-[#FAF8F5] transition-colors relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={images.length >= 5}
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <p className="text-sm text-[var(--text-muted)]">Click or drag images here to upload.</p>
                </div>
              </div>
              
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--border)] group">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--border)]">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="confirmTags"
                  checked={formData.confirmTags}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-5 h-5 text-[var(--accent)] rounded border-[var(--border)] focus:ring-[var(--accent)]"
                />
                <span className="text-sm text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                  I confirm that the product is unused, unwashed, and has all original tags attached. <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[var(--foreground)] text-white font-bold tracking-widest uppercase py-4 rounded-xl hover:bg-[var(--accent)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ color: '#ffffff' }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
