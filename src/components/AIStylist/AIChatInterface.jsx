'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OutfitRecommendation from './OutfitRecommendation';
import { useAIChat } from '../../context/AIChatContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';

const SUGGESTION_CHIPS = [
  "College Outfit", "Party Wear", "Under ₹2000",
  "Black Outfit", "Casual", "Trending"
];

const WELCOME_ACTIONS = [
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, label: "Complete My Outfit" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, label: "Find Similar Style" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, label: "Shop by Budget" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, label: "Shop by Occasion" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, label: "Shop by Colour" },
  { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>, label: "Trending Collection" }
];

export default function AIChatInterface({ initialPrompt }) {
  const { conversations, activeConversationId, setActiveConversationId, saveMessageToChat, saveOutfit } = useAIChat();
  const { token } = useAuth();
  const { addToWishlist, isWishlisted } = useWishlist();
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const activeConv = conversations.find(c => c._id === activeConversationId);
  const messages = (activeConv && activeConv.messages.length > 0) ? activeConv.messages : optimisticMessages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (!activeConversationId) {
      setOptimisticMessages([]);
    }
  }, [activeConversationId]);

  const hasSentInitialRef = useRef(false);
  useEffect(() => {
    if (initialPrompt && !hasSentInitialRef.current) {
      hasSentInitialRef.current = true;
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1200;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/webp', 0.8);
          const base64 = dataUrl.split(',')[1];
          resolve({ base64, dataUrl });
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert("Please upload a valid image file.");
        return;
    }

    try {
        setIsLoading(true);
        const { base64, dataUrl } = await compressImage(file);
        
        const userMsg = { id: Date.now().toString(), role: 'user', type: 'image', url: dataUrl };
        const newMessages = [...messages, userMsg];
        setOptimisticMessages(newMessages);
        
        const newConvId = await saveMessageToChat("Image Search", newMessages, activeConversationId);
        if (!activeConversationId) setActiveConversationId(newConvId);
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/vision-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64, mimeType: 'image/webp' })
        });
        
        const data = await res.json();
        setIsLoading(false);

        const aiMessages = [...newMessages];

        if (!res.ok) {
            aiMessages.push({ id: Date.now().toString() + '_err', role: 'ai', type: 'text', content: data.message || "Failed to process image." });
        } else {
            if (data.attributes) {
                const attrText = `**Detected Attributes:**\n• Category: ${data.attributes.category?.join(', ')}\n• Fit: ${data.attributes.fit?.join(', ')}\n• Colours: ${data.attributes.primary_colors?.join(', ')}\n• Style: ${data.attributes.style?.join(', ')}`;
                aiMessages.push({ id: Date.now().toString() + '_attr', role: 'ai', type: 'text', content: attrText });
            }
            if (data.message) {
                aiMessages.push({ id: Date.now().toString() + '_txt', role: 'ai', type: 'text', content: data.message });
            }
            if (data.products && data.products.length > 0) {
                aiMessages.push({ id: Date.now().toString() + '_products', role: 'ai', type: 'products', data: data.products });
            }
        }
        await saveMessageToChat("Image Search", aiMessages, newConvId);

    } catch (err) {
        console.error(err);
        setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
          handleFileUpload({ target: { files: [file] } });
      }
  };

  const handleSend = async (payload) => {
    // Guard: prevent double-submit while a request is in-flight
    if (isLoading) return;

    const isObject = typeof payload === 'object' && payload !== null;
    const text = isObject ? `Find matches for ${payload.product?.name}` : payload;
    
    if (typeof text === 'string' && !text.trim()) return;

    const userMsg = { id: Date.now().toString(), role: 'user', type: 'text', content: text };
    const newMessages = [...messages, userMsg];
    
    setOptimisticMessages(newMessages);
    setInput("");

    // Check for conversational save intent
    const lowerText = text.toLowerCase();
    const isSaveIntent = /save|add.*wishlist|wishlist/i.test(lowerText) && (lowerText.includes('this') || lowerText.includes('outfit') || lowerText.includes('all') || lowerText.includes('these') || lowerText.includes('product'));

    if (isSaveIntent) {
      setIsLoading(true);
      setTimeout(async () => {
        // Find last AI message with products or outfits
        const lastRec = [...messages].reverse().find(m => m.role === 'ai' && (m.type === 'outfits' || m.type === 'products'));
        let itemsToSave = [];
        if (lastRec) {
          if (lastRec.type === 'outfits' && Array.isArray(lastRec.data)) {
            itemsToSave = lastRec.data.flatMap(o => o.items || []);
          } else if (lastRec.type === 'products' && Array.isArray(lastRec.data)) {
            itemsToSave = lastRec.data;
          }
        }

        const availableItems = itemsToSave.filter(p => p && p.stock !== 0 && p.totalStock !== 0);
        const unavailableCount = itemsToSave.length - availableItems.length;

        let aiReply = "Done! I've added all recommended products to your Wishlist.";
        if (itemsToSave.length === 0) {
          aiReply = "I couldn't find any recently recommended products in our chat to save. Ask me for an outfit recommendation first!";
        } else if (availableItems.length === 0) {
          aiReply = "Sorry, the recommended items are currently out of stock and couldn't be saved.";
        } else if (unavailableCount > 0) {
          aiReply = `Done! Saved ${availableItems.length} available products to your Wishlist. (${unavailableCount} item(s) were out of stock).`;
        } else {
          addToWishlist(availableItems, "All recommended products saved");
        }

        setIsLoading(false);
        const aiMsg = { id: Date.now().toString() + '_txt', role: 'ai', type: 'text', content: aiReply };
        const updatedMsgs = [...newMessages, aiMsg];
        const newConvId = await saveMessageToChat(text, updatedMsgs, activeConversationId);
        if (!activeConversationId) setActiveConversationId(newConvId);
      }, 400);
      return;
    }

    setIsLoading(true);
    
    // Save user message immediately
    const newConvId = await saveMessageToChat(text, newMessages, activeConversationId);
    if (!activeConversationId) setActiveConversationId(newConvId);

    try {
      const bodyPayload = isObject ? { intent: 'complete_outfit', product: payload.product, conversationId: newConvId } : { prompt: text, conversationId: newConvId };
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/chat`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      
      const aiMessages = [...newMessages];
      if (data.message) {
        aiMessages.push({ id: Date.now().toString() + '_txt', role: 'ai', type: 'text', content: data.message });
      }
      
      if (data.outfits && data.outfits.length > 0) {
        aiMessages.push({ id: Date.now().toString() + '_outfit', role: 'ai', type: 'outfits', data: data.outfits });
      } else if (data.products && data.products.length > 0) {
        aiMessages.push({ id: Date.now().toString() + '_products', role: 'ai', type: 'products', data: data.products });
      }

      await saveMessageToChat(text, aiMessages, newConvId);

    } catch (error) {
      console.error(error);
      const errMsgs = [...newMessages, { id: Date.now().toString() + '_err', role: 'ai', type: 'text', content: "Sorry, I'm having trouble connecting to my servers right now." }];
      await saveMessageToChat(text, errMsgs, newConvId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
        className="flex flex-col h-full bg-[#111111] relative w-full"
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
    >
      {isDragging && (
          <div className="absolute inset-0 bg-[#C8A96A]/10 border-2 border-dashed border-[#C8A96A] z-50 flex items-center justify-center backdrop-blur-sm pointer-events-none">
              <div className="text-[#C8A96A] font-bold text-2xl tracking-widest uppercase bg-black/50 px-8 py-4 rounded-xl">Drop Image Here</div>
          </div>
      )}
      
      <input 
        type="file" 
        accept="image/png, image/jpeg, image/webp" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      {/* Chat History or Welcome Screen */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        
        {messages.length === 0 ? (
            <div className="min-h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 animate-fade-in py-8">
                <div className="w-20 h-20 bg-[rgba(200,169,106,0.1)] rounded-full flex items-center justify-center mb-4 border border-[#C8A96A]/20">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C8A96A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4l5 5L8 21l-5-1 1-5z"/><path d="M15 4l5 5"/></svg>
                </div>
                <h1 className="text-3xl font-medium text-white tracking-wide">Welcome to Downtown AI Stylist</h1>
                <p className="text-[#888888] text-lg max-w-md">Your personal fashion concierge. How can I help you elevate your style today?</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full mt-8">
                    {WELCOME_ACTIONS.map(action => (
                        <button 
                            key={action.label}
                            disabled={isLoading}
                            onClick={() => {
                                if (action.label === 'Find Similar Style') fileInputRef.current?.click();
                                else handleSend(action.label);
                            }}
                            className="bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(200,169,106,0.1)] border border-[rgba(255,255,255,0.05)] hover:border-[#C8A96A]/30 p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 group"
                        >
                        <span className="text-2xl group-hover:scale-110 transition-transform flex items-center justify-center" style={{color:'#C8A96A'}}>{action.icon}</span>
                            <span className="text-sm text-gray-300 group-hover:text-white font-medium">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        ) : (
            <div className="space-y-8">
                <AnimatePresence initial={false}>
                {messages.map((msg) => (
                    <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                    <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-[#E8DCC4] text-[#111111] rounded-2xl rounded-tr-sm p-3 md:p-4 shadow-sm' : 'text-gray-200'}`}>
                        {msg.type === 'image' && (
                            <img src={msg.url} alt="User Upload" className="max-w-[200px] max-h-[300px] object-contain rounded-lg shadow-sm border border-black/10" />
                        )}

                        {msg.type === 'text' && (
                        <div className={msg.role === 'ai' ? 'bg-[#1C1C1C] border border-[#C8A96A]/25 p-5 rounded-2xl rounded-tl-sm shadow-sm whitespace-pre-wrap text-base font-light tracking-wide' : 'text-base font-medium'}>
                            {msg.content}
                        </div>
                        )}
                        
                        {msg.type === 'products' && (
                        <div className="relative mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[#C8A96A] text-sm uppercase tracking-widest font-semibold">Recommended Products</span>
                            </div>
                            <div className="flex flex-wrap gap-6 mt-2">
                            {msg.data.map((product, j) => (
                                <div key={`${product._id || product.id}-${j}`} className="w-[230px] sm:w-[250px] flex-shrink-0">
                                <OutfitRecommendation product={product} compact={false} />
                                </div>
                            ))}
                            </div>
                        </div>
                        )}
                        
                        {msg.type === 'outfits' && (
                        <div className="flex flex-col gap-6 mt-2">
                            {msg.data.map((outfit, i) => (
                              <div key={i} className="bg-[#1C1C1C] border border-[#C8A96A]/25 p-6 rounded-2xl w-fit max-w-full">
                                  <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
                                      <h4 className="text-white font-semibold text-lg tracking-wide">{outfit.title}</h4>
                                  </div>
                                  <div className="flex flex-wrap gap-6">
                                  {outfit.items.map((product, j) => (
                                      <div key={`${product._id || product.id}-${j}`} className="w-[230px] sm:w-[250px] flex-shrink-0">
                                      <OutfitRecommendation product={product} compact={false} />
                                      </div>
                                  ))}
                                  </div>
                              </div>
                            ))}
                        </div>
                        )}
                    </div>
                    </motion.div>
                ))}
                
                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-[#1C1C1C] border border-[#C8A96A]/25 p-5 rounded-2xl rounded-tl-sm shadow-sm flex gap-3 items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C8A96A] animate-pulse" style={{ animationDelay: '0ms' }} />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C8A96A] animate-pulse" style={{ animationDelay: '150ms' }} />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C8A96A] animate-pulse" style={{ animationDelay: '300ms' }} />
                        <span className="text-[#C8A96A] text-sm font-medium tracking-wider ml-2 animate-pulse">Styling...</span>
                    </div>
                    </motion.div>
                )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:px-8 md:py-4 border-t border-[#C8A96A]/25 bg-[#111111]">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-stretch">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="relative flex items-center mb-3 w-full gap-2"
          >
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.04)] border border-[#C8A96A]/25 text-[#C8A96A] hover:bg-[rgba(255,255,255,0.08)] hover:border-[#C8A96A] transition-all"
                title="Upload Image"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
            </button>
            <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe outfit or upload image..."
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[#C8A96A]/25 rounded-full py-3 pl-5 pr-14 text-white placeholder-gray-500 focus:outline-none focus:border-[#C8A96A] focus:bg-[rgba(255,255,255,0.06)] transition-all text-base"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-[#C8A96A] text-black hover:bg-[#e5c98f] disabled:opacity-50 disabled:hover:bg-[#C8A96A] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
            </div>
          </form>

          {/* Suggestion Chips */}
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-none mask-fade-edges items-center">
            <span className="text-[#C8A96A] text-xs uppercase tracking-widest mr-2 whitespace-nowrap">Try:</span>
            {SUGGESTION_CHIPS.map(chip => (
              <button
                key={chip}
                disabled={isLoading}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-[rgba(255,255,255,0.04)] border border-[#C8A96A]/25 text-sm text-gray-300 hover:text-white hover:border-[#C8A96A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
