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

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full bg-[#1A1A1A] border-r border-[#C8A96A]/20 flex flex-col flex-shrink-0 overflow-hidden"
            style={{ minWidth: 0 }}
        >
            {/* New Chat + Search */}
            <div className="p-4 flex flex-col gap-3">
                <button
                    onClick={createNewChat}
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
                                onClick={() => setActiveConversationId(conv._id)}
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
                                onClick={() => setActiveConversationId(conv._id)}
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
                        <span className="text-3xl mb-3">💬</span>
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

    let previewText = 'No messages yet';
    if (lastMsg) {
        if (lastMsg.type === 'text' && lastMsg.content) {
            previewText = lastMsg.content;
        } else if (lastMsg.type === 'image') {
            previewText = '📷 Image';
        } else if (lastMsg.type === 'products') {
            previewText = '🛍 Products';
        } else if (lastMsg.type === 'outfits') {
            previewText = '👔 Outfit';
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
            <p className="text-xs text-gray-500 truncate pr-14">{previewText}</p>

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
