const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/AIStylist/AIChatInterface.jsx');
let code = fs.readFileSync(filePath, 'utf8');

const replacement = `
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OutfitRecommendation from './OutfitRecommendation';

const SUGGESTION_CHIPS = [
  "College Outfit", "Party Wear", "Under ₹2000",
  "Black Outfit", "Casual", "Trending"
];

export default function AIChatInterface({ initialPrompt }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'ai',
      type: 'text',
      content: "👋 Welcome to Downtown AI Stylist.\\n\\nI'm your personal fashion assistant.\\n\\nTell me your budget, preferred fit, colour, occasion, or upload a photo of an outfit you like!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
          
          // Max dimensions
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
          
          // Compress to WEBP
          const dataUrl = canvas.toDataURL('image/webp', 0.8);
          // Get base64 part
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
    
    // Validate
    if (!file.type.startsWith('image/')) {
        alert("Please upload a valid image file.");
        return;
    }

    try {
        setIsLoading(true);
        const { base64, dataUrl } = await compressImage(file);
        
        // Add user image message
        const userMsg = { id: Date.now().toString(), role: 'user', type: 'image', url: dataUrl };
        setMessages(prev => [...prev, userMsg]);
        
        const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/vision-search\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64, mimeType: 'image/webp' })
        });
        
        const data = await res.json();
        setIsLoading(false);

        if (!res.ok) {
            setMessages(prev => [...prev, { id: Date.now().toString() + '_err', role: 'ai', type: 'text', content: data.message || "Failed to process image." }]);
            return;
        }

        if (data.attributes) {
            const attrText = \`**Detected Attributes:**\\n• Category: \${data.attributes.category?.join(', ')}\\n• Fit: \${data.attributes.fit?.join(', ')}\\n• Colours: \${data.attributes.primary_colors?.join(', ')}\\n• Style: \${data.attributes.style?.join(', ')}\`;
            setMessages(prev => [...prev, { id: Date.now().toString() + '_attr', role: 'ai', type: 'text', content: attrText }]);
        }

        if (data.message) {
            setMessages(prev => [...prev, { id: Date.now().toString() + '_txt', role: 'ai', type: 'text', content: data.message }]);
        }
        
        if (data.products && data.products.length > 0) {
            setMessages(prev => [...prev, { id: Date.now().toString() + '_products', role: 'ai', type: 'products', data: data.products }]);
        }
    } catch (err) {
        console.error(err);
        setIsLoading(false);
        setMessages(prev => [...prev, { id: Date.now().toString() + '_err', role: 'ai', type: 'text', content: "An error occurred while uploading the image." }]);
    }
  };

  const handleDrop = (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
          const fakeEvent = { target: { files: [file] } };
          handleFileUpload(fakeEvent);
      }
  };

  const handleDragOver = (e) => {
      e.preventDefault();
      setIsDragging(true);
  };

  const handleDragLeave = (e) => {
      e.preventDefault();
      setIsDragging(false);
  };

  const handleSend = async (payload) => {
    const isObject = typeof payload === 'object' && payload !== null;
    const text = isObject ? \`Find matches for \${payload.product?.name}\` : payload;
    
    if (typeof text === 'string' && !text.trim()) return;

    const userMsg = { id: Date.now().toString(), role: 'user', type: 'text', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const bodyPayload = isObject ? { intent: 'complete_outfit', product: payload.product } : { prompt: text };
      const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/chat\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      
      setIsLoading(false);
      
      if (data.message) {
        setMessages(prev => [...prev, { id: Date.now().toString() + '_txt', role: 'ai', type: 'text', content: data.message }]);
      }
      
      if (data.outfits && data.outfits.length > 0) {
        setMessages(prev => [...prev, { id: Date.now().toString() + '_outfit', role: 'ai', type: 'outfits', data: data.outfits }]);
      } else if (data.products && data.products.length > 0) {
        setMessages(prev => [...prev, { id: Date.now().toString() + '_products', role: 'ai', type: 'products', data: data.products }]);
      }

    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setMessages(prev => [...prev, { id: Date.now().toString() + '_err', role: 'ai', type: 'text', content: "Sorry, I'm having trouble connecting to my servers right now." }]);
    }
  };

  return (
    <div 
        className="flex flex-col h-full bg-[#111111] relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
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

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={\`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}
            >
              <div className={\`max-w-[85%] \${msg.role === 'user' ? 'bg-[#E8DCC4] text-[#111111] rounded-2xl rounded-tr-sm p-2 md:p-4 shadow-sm' : 'text-gray-200'}\`}>
                {msg.type === 'image' && (
                    <img src={msg.url} alt="User Upload" className="max-w-[200px] max-h-[300px] object-contain rounded-lg shadow-sm border border-black/10" />
                )}

                {msg.type === 'text' && (
                  <div className={msg.role === 'ai' ? 'bg-[#1C1C1C] border border-[#C8A96A]/25 p-5 rounded-2xl rounded-tl-sm shadow-sm whitespace-pre-wrap text-base font-light tracking-wide' : 'text-base font-medium'}>
                    {msg.content}
                  </div>
                )}
                
                {msg.type === 'products' && (
                  <div className="flex flex-wrap gap-4 mt-4">
                    {msg.data.map((product, j) => (
                      <div key={\`\${product._id || product.id}-\${j}\`} className="w-40 md:w-48">
                        <OutfitRecommendation product={product} compact={false} />
                      </div>
                    ))}
                  </div>
                )}
                
                {msg.type === 'outfits' && (
                  <div className="flex flex-col gap-6 mt-2">
                    {msg.data.map((outfit, i) => (
                      <div key={i} className="bg-[#1C1C1C] border border-[#C8A96A]/25 p-5 rounded-2xl w-fit max-w-full">
                        <h4 className="text-white font-medium mb-4 text-lg">{outfit.title}</h4>
                        <div className="flex flex-wrap gap-4">
                          {outfit.items.map((product, j) => (
                            <div key={\`\${product._id || product.id}-\${j}\`} className="w-40 md:w-48">
                              <OutfitRecommendation product={product} compact={false} />
                            </div>
                          ))}
                        </div>
                        <div className="mt-5 flex gap-2">
                            <button className="w-full bg-[#C8A96A] text-black py-3 rounded-lg font-medium text-sm hover:bg-[#e5c98f] transition-colors uppercase tracking-widest">
                                Add Entire Outfit to Cart
                            </button>
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
                <span className="text-[#C8A96A] text-sm font-medium tracking-wider ml-2 animate-pulse">Processing...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
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
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-[rgba(255,255,255,0.04)] border border-[#C8A96A]/25 text-sm text-gray-300 hover:text-white hover:border-[#C8A96A] transition-colors"
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
`;

fs.writeFileSync(filePath, replacement);
console.log('Successfully updated AIChatInterface.jsx');
