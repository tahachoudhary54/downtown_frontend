'use client';

import { useState, useRef, useEffect } from 'react';

export default function SearchableDropdown({ 
  label, 
  options, 
  value, 
  onChange, 
  onCreate, 
  placeholder = "Search...", 
  disabled = false,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const displayValue = options.find(opt => opt.value === value)?.label || '';

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
        {label} {required && '*'}
      </label>
      
      <div 
        className={`w-full border border-[var(--border)] rounded-md px-3 py-2 text-sm bg-white flex justify-between items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'focus-within:border-[var(--accent)]'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={displayValue ? "text-gray-900" : "text-gray-400"}>
          {displayValue || placeholder}
        </span>
        <span className="text-gray-400 text-xs">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-[var(--border)] rounded-md shadow-lg max-h-60 flex flex-col">
          <div className="p-2 border-b border-gray-100">
            <input 
              type="text" 
              className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          
          <div className="overflow-y-auto flex-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div 
                  key={opt.value}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${value === opt.value ? 'bg-gray-50 font-medium text-[var(--accent)]' : 'text-gray-700'}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center italic">
                No results found
              </div>
            )}
          </div>

          {onCreate && (
            <div 
              className="border-t border-gray-100 p-2 bg-gray-50 rounded-b-md cursor-pointer hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onCreate();
                setIsOpen(false);
              }}
            >
              <div className="text-sm font-bold text-blue-600 text-center">
                + Create New
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
