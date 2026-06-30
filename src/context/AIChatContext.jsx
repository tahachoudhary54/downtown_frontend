'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const AIChatContext = createContext({
    conversations: [],
    activeConversationId: null,
    savedOutfits: [],
    isSidebarOpen: true,
    isLoading: true,
    toggleSidebar: () => {},
    setActiveConversationId: () => {},
    createNewChat: () => {},
    saveMessageToChat: async () => {},
    deleteConversation: async () => {},
    clearAllConversations: async () => {},
    pinConversation: async () => {},
    saveOutfit: async () => {},
    removeOutfit: async () => {}
});

export const useAIChat = () => useContext(AIChatContext);

export function AIChatProvider({ children }) {
    const { user, token } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [savedOutfits, setSavedOutfits] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const createNewChat = () => setActiveConversationId(null);

    // Load data from LocalStorage
    const loadLocalData = () => {
        try {
            const localConvs = JSON.parse(localStorage.getItem("ai_conversations") || "[]");
            const localOutfits = JSON.parse(localStorage.getItem("ai_outfits") || "[]");
            setConversations(localConvs);
            setSavedOutfits(localOutfits);
        } catch (e) {
            console.error("Failed to parse local storage", e);
        }
        setIsLoading(false);
    };

    // Fetch from MongoDB
    const fetchCloudData = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const resConvs = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resConvs.ok) {
                const data = await resConvs.json();
                setConversations(data);
            }

            const resOutfits = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/saved-outfits`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resOutfits.ok) {
                const data = await resOutfits.json();
                setSavedOutfits(data);
            }
        } catch (e) {
            console.error(e);
        }
        setIsLoading(false);
    };

    // Sync local to cloud
    const syncLocalToCloud = async () => {
        try {
            const localConvs = JSON.parse(localStorage.getItem("ai_conversations") || "[]");
            const localOutfits = JSON.parse(localStorage.getItem("ai_outfits") || "[]");
            
            if (localConvs.length === 0 && localOutfits.length === 0) return;

            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/conversations/sync`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ localConversations: localConvs, localOutfits: localOutfits })
            });

            // Clear local storage after successful sync
            localStorage.removeItem("ai_conversations");
            localStorage.removeItem("ai_outfits");
        } catch (e) {
            console.error("Sync failed", e);
        }
    };

    useEffect(() => {
        if (user && token) {
            syncLocalToCloud().then(() => fetchCloudData());
        } else {
            loadLocalData();
        }
    }, [user, token]);

    const saveMessageToChat = async (prompt, messagesToSave, currentConvId = null) => {
        if (user && token) {
            // Cloud path
            if (!currentConvId) {
                // Create new
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/conversations`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ prompt, messages: messagesToSave })
                });
                const newConv = await res.json();
                setConversations(prev => [newConv, ...prev]);
                return newConv._id;
            } else {
                // Update existing
                await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/conversations/${currentConvId}`, {
                    method: 'PUT',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ messages: messagesToSave })
                });
                setConversations(prev => prev.map(c => c._id === currentConvId ? { ...c, messages: messagesToSave, updatedAt: new Date().toISOString() } : c));
                return currentConvId;
            }
        } else {
            // Local path
            let convId = currentConvId;
            setConversations(prev => {
                let newConvs = [...prev];
                if (!convId) {
                    convId = "local_" + Date.now();
                    newConvs.unshift({
                        _id: convId,
                        title: prompt ? (prompt.length > 20 ? prompt.substring(0,20)+"..." : prompt) : "New Chat",
                        messages: messagesToSave,
                        isPinned: false,
                        updatedAt: new Date().toISOString()
                    });
                } else {
                    const idx = newConvs.findIndex(c => c._id === convId);
                    if (idx > -1) {
                        newConvs[idx].messages = messagesToSave;
                        newConvs[idx].updatedAt = new Date().toISOString();
                        // Move to top if not pinned
                        if (!newConvs[idx].isPinned) {
                            const updatedConv = newConvs.splice(idx, 1)[0];
                            newConvs.unshift(updatedConv);
                        }
                    }
                }
                
                // Limit to 100
                if (newConvs.length > 100) newConvs = newConvs.slice(0, 100);
                
                localStorage.setItem("ai_conversations", JSON.stringify(newConvs));
                return newConvs;
            });
            return convId;
        }
    };

    const deleteConversation = async (id) => {
        if (user && token) {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/conversations/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
        setConversations(prev => {
            const next = prev.filter(c => c._id !== id);
            if (!user) localStorage.setItem("ai_conversations", JSON.stringify(next));
            return next;
        });
        if (activeConversationId === id) setActiveConversationId(null);
    };

    const clearAllConversations = async () => {
        if (user && token) {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/conversations`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
        setConversations([]);
        setActiveConversationId(null);
        if (!user) localStorage.removeItem("ai_conversations");
    };

    const pinConversation = async (id, isPinned) => {
        if (user && token) {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/conversations/${id}/pin`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isPinned })
            });
        }
        setConversations(prev => {
            const next = prev.map(c => c._id === id ? { ...c, isPinned } : c);
            next.sort((a, b) => {
                if (a.isPinned === b.isPinned) return new Date(b.updatedAt) - new Date(a.updatedAt);
                return a.isPinned ? -1 : 1;
            });
            if (!user) localStorage.setItem("ai_conversations", JSON.stringify(next));
            return next;
        });
    };

    const saveOutfit = async (products) => {
        const payload = {
            products: products,
            priceText: "Saved from Chat",
            previewImages: products.map(p => p.img).filter(Boolean)
        };

        if (user && token) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/saved-outfits`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const newOutfit = await res.json();
            setSavedOutfits(prev => [newOutfit, ...prev]);
        } else {
            const newOutfit = { ...payload, _id: "local_outfit_" + Date.now(), createdAt: new Date().toISOString() };
            setSavedOutfits(prev => {
                const next = [newOutfit, ...prev];
                localStorage.setItem("ai_outfits", JSON.stringify(next));
                return next;
            });
        }
    };

    const removeOutfit = async (id) => {
        if (user && token) {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/saved-outfits/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
        setSavedOutfits(prev => {
            const next = prev.filter(o => o._id !== id);
            if (!user) localStorage.setItem("ai_outfits", JSON.stringify(next));
            return next;
        });
    };

    return (
        <AIChatContext.Provider value={{
            conversations, activeConversationId, savedOutfits, isSidebarOpen, isLoading,
            toggleSidebar, setActiveConversationId, createNewChat,
            saveMessageToChat, deleteConversation, clearAllConversations, pinConversation,
            saveOutfit, removeOutfit
        }}>
            {children}
        </AIChatContext.Provider>
    );
}
