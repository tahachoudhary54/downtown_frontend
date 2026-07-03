'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIChat } from '../../context/AIChatContext';

export default function AISidebar() {
    const {
        conversations, activeConversationId, isSidebarOpen,
        createNewChat, setActiveConversationId, deleteConversation, clearAllConversations, pinConversation
    } = useAIChat();

    const [search, setSearch] = useState('');

    if (!isSidebarOpen) return null;

    const filteredConvs = conversations.filter(c =>
        c.title && c.title.toLowerCase().includes(search.toLowerCase())
    );
    const pinned = filteredConvs.filter(c => c.isPinned);
    const recent = filteredConvs.filter(c => !c.isPinned);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const handleAction = (actionFn) => {
        actionFn();
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            toggleSidebar();
        }
    };

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full bg-[#1A1A1A] border-r border-[#C8A96A]/20 flex flex-col flex-shrink-0 overflow-hidden absolute lg:static z-20 w-full sm:w-[300px]"
            style={{ minWidth: 0 }}
        >
            {/* New Chat + Search */}
            <div className="p-4 flex flex-col gap-3">
                <button
                    onClick={() => handleAction(createNewChat)}
                    className="w-full flex items-center justify-center gap-2 bg-[#C8A96A] text-black font-semibold py-3 rounded-lg hover:bg-[#e5c98f] transition-colors text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Chat
                </button>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#111111] text-sm text-white placeholder-gray-500 border border-[#C8A96A]/20 rounded-lg py-2 pl-8 pr-3 focus:outline-none focus:border-[#C8A96A]"
                    />
                    <svg className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">

                {pinned.length > 0 && (
                    <div className="mb-3">
                        <h3 className="text-[#888888] text-[10px] font-semibold uppercase tracking-widest px-2 mb-2">
                            Pinned
                        </h3>
                        {pinned.map(conv => (
                            <ConversationItem
                                key={conv._id}
                                conv={conv}
                                isActive={activeConversationId === conv._id}
                                onClick={() => handleAction(() => setActiveConversationId(conv._id))}
                                onPin={() => pinConversation(conv._id, !conv.isPinned)}
                                onDelete={() => {
                                    if (window.confirm('Delete this conversation?')) {
                                        deleteConversation(conv._id);
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}

                {recent.length > 0 && (
                    <div className="mb-3">
                        <h3 className="text-[#888888] text-[10px] font-semibold uppercase tracking-widest px-2 mb-2">
                            Recent
                        </h3>
                        {recent.map(conv => (
                            <ConversationItem
                                key={conv._id}
                                conv={conv}
                                isActive={activeConversationId === conv._id}
                                onClick={() => handleAction(() => setActiveConversationId(conv._id))}
                                onPin={() => pinConversation(conv._id, !conv.isPinned)}
                                onDelete={() => {
                                    if (window.confirm('Delete this conversation?')) {
                                        deleteConversation(conv._id);
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}

                {conversations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <p className="text-gray-500 text-sm">No conversations yet.</p>
                        <p className="text-gray-600 text-xs mt-1">Start chatting to see your history here.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[#C8A96A]/15">
                <button
                    onClick={() => {
                        if (window.confirm('Delete all conversations? This cannot be undone.')) {
                            clearAllConversations();
                        }
                    }}
                    className="w-full flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 p-2 rounded-lg transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All Chats
                </button>
            </div>
        </motion.div>
    );
}

function ConversationItem({ conv, isActive, onClick, onPin, onDelete }) {
    const lastMsg = conv.messages && conv.messages.length > 0
        ? conv.messages[conv.messages.length - 1]
        : null;

    let preview = { text: 'No messages yet', icon: null };
    if (lastMsg) {
        if (lastMsg.type === 'text' && lastMsg.content) {
            preview.text = lastMsg.content;
        } else if (lastMsg.type === 'image') {
            preview.text = 'Image';
            preview.icon = <svg className="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>;
        } else if (lastMsg.type === 'products') {
            preview.text = 'Products';
            preview.icon = <svg className="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
        } else if (lastMsg.type === 'outfits') {
            preview.text = 'Outfit';
            preview.icon = <svg className="w-3 h-3 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>;
        }
    }

    const activeClasses = 'bg-[rgba(200,169,106,0.12)] border border-[#C8A96A]/20';
    const inactiveClasses = 'hover:bg-[rgba(255,255,255,0.04)] border border-transparent';

    return (
        <div
            onClick={onClick}
            className={'group relative p-3 mb-1 rounded-lg cursor-pointer transition-all ' + (isActive ? activeClasses : inactiveClasses)}
        >
            <div className="flex justify-between items-start mb-0.5">
                <h4 className={'text-sm font-medium truncate pr-14 ' + (isActive ? 'text-[#C8A96A]' : 'text-gray-200')}>
                    {conv.title || 'New Chat'}
                </h4>
            </div>
            <p className="text-xs text-gray-500 truncate pr-14 flex items-center">{preview.icon}{preview.text}</p>

            <div className={'absolute right-1.5 top-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ' + (isActive ? 'opacity-100' : '')}>
                <button
                    onClick={(e) => { e.stopPropagation(); onPin(); }}
                    className={'p-1.5 rounded hover:bg-black/30 transition-colors ' + (conv.isPinned ? 'text-[#C8A96A]' : 'text-gray-500 hover:text-white')}
                    title={conv.isPinned ? 'Unpin' : 'Pin'}
                >
                    <svg className="w-3 h-3" fill={conv.isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-black/30 transition-colors"
                    title="Delete"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
