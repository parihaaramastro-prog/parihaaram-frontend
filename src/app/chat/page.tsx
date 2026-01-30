"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import {
    Send, Bot, User, ArrowLeft, Globe,
    Lightbulb, MoreHorizontal, ArrowUp, Sidebar, CircleUser,
    Plus, MessageSquare, Trash2, X, Sparkles, Users, Briefcase, Heart, Activity, Coins, Check, Loader2, LogOut
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { SavedHoroscope, horoscopeService } from "@/lib/services/horoscope";
import { aiService } from "@/lib/services/ai";
import { creditService } from "@/lib/services/credits";
import { createClient } from "@/lib/supabase";
import { settingsService } from "@/lib/services/settings";
import { loadRazorpay } from "@/lib/loadRazorpay";
import ProfileSelectionModal from "@/components/ProfileSelectionModal";
import ReactMarkdown from 'react-markdown';
import { chatService, ChatSession, ChatMessage } from "@/lib/services/chat";
import Footer from "@/components/Footer";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import { masterPromptCache } from "@/lib/services/masterPromptCache";


function ChatContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // User State
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [packConfig, setPackConfig] = useState({ price: 49, credits: 10 });
    const [razorpayEnabled, setRazorpayEnabled] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Profile Lookup Map (to resolve IDs to Objects/Names)
    const [savedProfiles, setSavedProfiles] = useState<SavedHoroscope[]>([]);

    // Context State
    const [primaryProfile, setPrimaryProfile] = useState<SavedHoroscope | null>(null);
    const [secondaryProfile, setSecondaryProfile] = useState<SavedHoroscope | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'primary' | 'secondary'>('primary');
    const [isTyping, setIsTyping] = useState(false);
    const [suggestionPrompts, setSuggestionPrompts] = useState<string[]>([]);

    // Credit State
    const [credits, setCredits] = useState<number | null>(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Sync with hydration
    const [mounted, setMounted] = useState(false);

    // 1. Initialize User & Settings & Profiles
    useEffect(() => {
        setMounted(true);
        const init = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUserId(user.id);
                setUserEmail(user.email || null);
                setCurrentUser(user);
                loadChats(user.id);

                // Load Profiles for Lookup
                try {
                    const profiles = await horoscopeService.getSavedHoroscopes();
                    setSavedProfiles(profiles);
                } catch (e) {
                    console.error("Error loading profiles:", e);
                }
            } else {
                // Not logged in -> Redirect to login?
                // The middleware typically handles this, but explicit check implies we expect auth
                // Actually, maybe we should redirect to home or login
                // For now, let's assume they might be guest? But we need DB access.
                // Redirect to login if not auth?
                // window.location.href = '/?login=true';
            }

            // Settings
            settingsService.getSettings().then(s => {
                setPackConfig({ price: s.pack_price, credits: s.pack_credits });
                setRazorpayEnabled(s.razorpay_enabled);

                // Cache the master prompt to set the tone for all AI interactions
                if (s.master_prompt) {
                    masterPromptCache.set(s.master_prompt);
                    console.log('[Master Prompt] Cached on login:', s.master_prompt.substring(0, 100) + '...');
                }
            });

            // Credits
            const c = await creditService.getCredits();
            setCredits(c);
        };

        const checkMobile = () => {
            const mobile = window.innerWidth < 1024; // lg breakpoint
            setIsMobile(mobile);
            if (mobile) setIsSidebarOpen(false);
            else setIsSidebarOpen(true);
        };

        init();
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const loadChats = async (uid: string) => {
        try {
            const sessions = await chatService.getSessions(uid);
            setChats(sessions);

            // Auto Select latest or first
            if (sessions.length > 0 && !currentChatId) {
                setCurrentChatId(sessions[0].id);
            } else if (sessions.length === 0) {
                // No chats? Wait for user action or create new?
                // User expects to see "New Chat" button
            }
        } catch (e) {
            console.error("Error loading chats:", e);
        }
    };

    // 2. Load Messages when Chat ID Changes
    useEffect(() => {
        if (!currentChatId || !userId) return;

        const fetchSession = async () => {
            setLoadingMessages(true);
            try {
                const session = await chatService.getSessionWithMessages(currentChatId);
                setMessages(session.messages || []);

                // Resolve Profiles
                if (session.primary_profile_id && savedProfiles.length > 0) {
                    const p1 = savedProfiles.find(p => p.id === session.primary_profile_id);
                    setPrimaryProfile(p1 || null);
                } else {
                    setPrimaryProfile(null);
                }

                if (session.secondary_profile_id && savedProfiles.length > 0) {
                    const p2 = savedProfiles.find(p => p.id === session.secondary_profile_id);
                    setSecondaryProfile(p2 || null);
                } else {
                    setSecondaryProfile(null);
                }

            } catch (e) {
                console.error("Error fetching messages:", e);
            } finally {
                setLoadingMessages(false);
                scrollToBottom();
            }
        };

        fetchSession();
    }, [currentChatId, userId, savedProfiles]); // Re-run if profiles load late

    const [validatingVibeCheck, setValidatingVibeCheck] = useState(false);
    const [autoStartProcessed, setAutoStartProcessed] = useState(false);

    // Auto-Start Check (New User from Landing / VibeCheck)
    useEffect(() => {
        const mode = searchParams.get('new');
        const profileIdFromUrl = searchParams.get('profileId');

        // Prevent re-running after we've already processed
        if (autoStartProcessed) return;

        if (mode === 'vibecheck' && userId && savedProfiles.length >= 2) {
            // Vibe Check Flow: Latest 2 profiles (Partner is usually latest [0], You are [1] or vice-versa depending on save order)

            const initVibeCheck = async () => {
                setValidatingVibeCheck(true);
                setAutoStartProcessed(true);
                try {
                    let partner = savedProfiles[0];
                    let you = savedProfiles[1];

                    // Helper to ensure chart data exists
                    const ensureChartData = async (p: SavedHoroscope) => {
                        if (p.chart_data && Object.keys(p.chart_data).length > 0) return p;

                        console.log(`Calculating chart for ${p.name}...`);
                        const res = await fetch("/api/astrology", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ dob: p.dob, tob: p.tob, lat: p.lat, lon: p.lon })
                        });

                        if (!res.ok) throw new Error("Failed to calculate chart");

                        const data = await res.json();
                        await horoscopeService.updateHoroscope(p.id, { chart_data: data });
                        return { ...p, chart_data: data };
                    };

                    // Validate both profiles in parallel
                    const [updatedPartner, updatedYou] = await Promise.all([
                        ensureChartData(partner),
                        ensureChartData(you)
                    ]);

                    // Update local state to prevent staleness
                    setSavedProfiles(prev => prev.map(p => {
                        if (p.id === updatedPartner.id) return updatedPartner;
                        if (p.id === updatedYou.id) return updatedYou;
                        return p;
                    }));

                    // Check for recent session to avoid dupes
                    const hasRecentSession = chats.length > 0 && chats[0].title.includes("Compatibility") && (new Date().getTime() - new Date(chats[0].updated_at).getTime() < 10000);

                    if (!hasRecentSession) {
                        createVibeCheckSession(updatedYou, updatedPartner);
                    }

                    // Clear the param so we don't re-run
                    router.replace('/chat');

                } catch (e) {
                    console.error("Vibe Check Init Error:", e);
                    alert("Failed to initialize Vibe Check. Please try selecting profiles manually.");
                } finally {
                    setValidatingVibeCheck(false);
                }
            };

            initVibeCheck();

        } else if (mode === 'true' && userId && savedProfiles.length > 0) {
            // Standard Flow from AI Landing Page
            setAutoStartProcessed(true);

            // Find the specific profile if provided, otherwise use the latest
            let targetProfile: SavedHoroscope | undefined;
            if (profileIdFromUrl) {
                targetProfile = savedProfiles.find(p => p.id === profileIdFromUrl);
            }
            if (!targetProfile) {
                targetProfile = savedProfiles[0]; // Fallback to latest
            }

            // Check for recent session to avoid dupes
            const hasRecentEmptyChat = chats.length > 0 && chats[0].title === "New Session" && (new Date().getTime() - new Date(chats[0].created_at).getTime() < 10000);

            if (!hasRecentEmptyChat && targetProfile) {
                console.log('[Auto-Start] Creating chat with profile:', targetProfile.name);
                createNewChatWithProfile(targetProfile);
            }

            // Clear the params
            router.replace('/chat');
        }
    }, [searchParams, userId, savedProfiles, autoStartProcessed, chats]);

    const createVibeCheckSession = async (p1: SavedHoroscope, p2: SavedHoroscope) => {
        if (!userId) return;
        try {
            const newSession = await chatService.createSession(userId, `Compatibility: ${p1.name} & ${p2.name}`, p1.id);
            // Update secondary profile immediately
            await chatService.updateSessionProfiles(newSession.id, undefined, p2.id);

            setChats(prev => [newSession, ...prev]);
            setCurrentChatId(newSession.id);
            setPrimaryProfile(p1);
            setSecondaryProfile(p2);

            // Do NOT auto-trigger AI. Let the "Empty State" UI handle it.
            // This is consistent with the new flow.

        } catch (e) {
            console.error(e);
        }
    };

    const createNewChatWithProfile = async (profile: SavedHoroscope) => {
        if (!userId) return;
        try {
            const newSession = await chatService.createSession(userId, "New Session", profile.id);
            setChats(prev => [newSession, ...prev]);
            setCurrentChatId(newSession.id);
            setPrimaryProfile(profile);

            // Auto-trigger Life Prediction for seamless onboarding
            const autoPrompt = `Analyze ${profile.name}'s chart and provide a detailed 'Life Prediction' covering: 1. Core Nature & Personality 2. Current Emotional State 3. Best Career Paths 4. Marriage & Relationship Outlook 5. Relationship with Parents. At the end, please list 3 specific follow-up questions I can ask to elaborate on these topics.`;

            // Wait a small delay for state to settle, then trigger the AI
            setTimeout(() => {
                handleSend(autoPrompt, true, { p1: profile }, newSession.id);
            }, 200);

        } catch (e) {
            console.error(e);
        }
    };

    const createNewChat = async (initialMessage?: string) => {
        if (!userId) return;

        // Optimization: If current chat is visually empty (no messages), just reset the context
        // instead of creating a DB entry. This acts as a "Start Over" button.
        if (messages.length === 0 && !initialMessage) {
            setPrimaryProfile(null);
            setSecondaryProfile(null);
            return;
        }

        try {
            const newSession = await chatService.createSession(userId, "New Session");
            setChats(prev => [newSession, ...prev]);
            setCurrentChatId(newSession.id);

            setCurrentChatId(newSession.id);

            // Chat starts empty to show the "Select Profile" UI

            if (initialMessage) {
                handleSend(initialMessage, false, undefined, newSession.id);
            }

            if (isMobile) setIsSidebarOpen(false);
            return newSession.id;
        } catch (e) {
            console.error(e);
        }
    };

    const deleteChat = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await chatService.deleteSession(id);
            setChats(prev => prev.filter(c => c.id !== id));
            if (currentChatId === id) {
                setCurrentChatId(null);
                setMessages([]);
                setPrimaryProfile(null);
                setSecondaryProfile(null);
            }
        } catch (error) {
            console.error("Failed to delete chat:", error);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);


    const handleProfileSelect = async (profile: SavedHoroscope) => {
        if (!userId) return;

        const isPrimary = modalMode === 'primary';

        try {
            // If no active chat, create one first
            if (!currentChatId) {
                const newSession = await chatService.createSession(userId, "New Session", profile.id);
                setChats(prev => [newSession, ...prev]);
                setCurrentChatId(newSession.id);
                setPrimaryProfile(profile);

                // Close modal
                setIsModalOpen(false);

                // Auto-trigger Life Prediction
                const autoPrompt = `Analyze my chart (${profile.name}) and give me a relatable life prediction. Focus on my nature, current vibe, and what's coming up. End with a hook to ask more questions.`;

                // Wait a bit for state to update, then send
                setTimeout(() => {
                    handleSend(autoPrompt, true, { p1: profile }, newSession.id);
                }, 100);

                return;
            }

            if (isPrimary) {
                await chatService.updateSessionProfiles(currentChatId, profile.id, undefined);
                setPrimaryProfile(profile);

                // Auto-trigger Life Prediction
                // We send a hidden message acting as the user asking for a prediction.
                // We pass the profile explicitly in overrideParams to ensure it's used even if state update is pending.
                const autoPrompt = `Analyze ${profile.name}'s chart and provide a detailed 'Life Prediction' covering: 1. Core Nature & Personality 2. Current Emotional State 3. Best Career Paths 4. Marriage & Relationship Outlook 5. Relationship with Parents. At the end, please list 3 specific follow-up questions I can ask to elaborate on these topics.`;

                // Only trigger if this is a fresh start (no messages yet) or user explicitly switches (context switch)
                // Actually, user requested "when profile is selected", so we just do it.
                handleSend(autoPrompt, true, { p1: profile });

            } else {
                await chatService.updateSessionProfiles(currentChatId, undefined, profile.id);
                setSecondaryProfile(profile);
            }

        } catch (e) {
            console.error("Error selecting profile:", e);
        }
    };

    const openProfileSelector = (mode: 'primary' | 'secondary') => {
        setModalMode(mode);
        setIsModalOpen(true);
    };

    const shouldShowProfileButton = (content: string) => {
        const lower = content.toLowerCase();
        return lower.includes("which profile") || lower.includes("select a profile") || lower.includes("choose a profile") || lower.includes("select the partner");
    };

    const shouldShowPartnerButton = (content: string) => {
        const lower = content.toLowerCase();
        return lower.includes("select the partner") || lower.includes("second profile") || lower.includes("partner's profile");
    };

    const handleSend = async (text: string = input, hidden: boolean = false, overrideParams?: { p1?: SavedHoroscope, p2?: SavedHoroscope }, specificSessionId?: string) => {
        if (!text.trim() && !hidden) return;
        const targetChatId = specificSessionId || currentChatId;

        if (!targetChatId) {
            return createNewChat(text);
        }

        // Optimistic User Msg
        const tempId = Date.now().toString();
        const userMsg: ChatMessage = {
            id: tempId,
            role: 'user',
            content: text,
            created_at: new Date().toISOString(),
            is_hidden: hidden
        };

        if (!hidden) setInput("");
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            // Save User Message
            await chatService.addMessage(targetChatId, 'user', text, hidden);

            // Prepare AI Context
            const effectivePrimary = overrideParams?.p1 || primaryProfile;
            const effectiveSecondary = overrideParams?.p2 || secondaryProfile;

            // Generate AI Response
            const response = await aiService.generateResponse(text, {
                primaryProfile: effectivePrimary || undefined,
                secondaryProfile: effectiveSecondary || undefined
            }, messages.filter(m => m.role !== 'system')); // Pass users/ai history only


            // Save AI Message
            console.log('[AI Response] Full reply length:', response.reply.length);
            console.log('[AI Response] First 500 chars:', response.reply.substring(0, 500));
            console.log('[AI Response] Last 500 chars:', response.reply.substring(Math.max(0, response.reply.length - 500)));

            const aiMsg = await chatService.addMessage(targetChatId, 'ai', response.reply);

            console.log('[Saved Message] Content length:', aiMsg.content.length);
            console.log('[Saved Message] Matches original?', aiMsg.content === response.reply);

            // Update State
            setMessages(prev => prev.map(m => m.id === tempId ? { ...userMsg, id: 'saved-' + tempId } : m).concat(aiMsg));

            // Update Title if needed (First visible message)
            const visibleMsgs = messages.filter(m => !m.is_hidden);
            if (visibleMsgs.length <= 1 && !hidden) {
                const newTitle = text.slice(0, 30) + (text.length > 30 ? '...' : '');
                await chatService.updateSessionTitle(targetChatId, newTitle);
                // Update sidebar list
                setChats(prev => prev.map(c => c.id === targetChatId ? { ...c, title: newTitle } : c));
            }

            if (response.remainingCredits !== undefined) {
                setCredits(response.remainingCredits);
            }

            // Set contextual suggestion prompts based on the response
            if (!hidden) {
                // Dynamic Suggestion Extraction Logic
                const dynamicSuggestions: string[] = [];
                const lastSentence = response.reply.trim().split(/[.!?]/).pop()?.trim();

                // 1. If AI ends with a question, that's the best immediate follow-up context
                if (response.reply.trim().endsWith("?")) {
                    const lastQuestion = response.reply.trim().split("\n").pop()?.trim();
                    if (lastQuestion && lastQuestion.length < 60) {
                        // Convert question to statement if possible, or just use generic "Answer this"
                        dynamicSuggestions.push("Answer this question");
                    }
                }

                // 2. Add Contextual "Tell me more" based on keywords
                const lowerReply = response.reply.toLowerCase();
                if (lowerReply.includes("career") || lowerReply.includes("job")) dynamicSuggestions.push("Tell me more about Career");
                if (lowerReply.includes("relationship") || lowerReply.includes("love") || lowerReply.includes("marriage")) dynamicSuggestions.push("Explore Relationship deeper");
                if (lowerReply.includes("health")) dynamicSuggestions.push("What about Health details?");

                // 3. Always have 'Explain in detail' as fallback
                dynamicSuggestions.push("Explain this in detail");

                // 4. Remedies if negative context
                if (lowerReply.includes("challenge") || lowerReply.includes("difficult") || lowerReply.includes("saturn") || lowerReply.includes("rahu")) {
                    dynamicSuggestions.push("What remedies can help?");
                }

                // Ensure unique and max 3
                const uniqueSuggestions = Array.from(new Set(dynamicSuggestions)).slice(0, 3);
                setSuggestionPrompts(uniqueSuggestions.length > 0 ? uniqueSuggestions : ["Explain in detail", "What remedies help?", "Tell me more"]);
            }

        } catch (error: any) {
            console.error(error);
            if (error.message === "OUT_OF_CREDITS") {
                setShowPayModal(true);
                const sysMsg = await chatService.addMessage(targetChatId, 'ai', "You have run out of messages. Please recharge to continue.", false);
                setMessages(prev => [...prev, sysMsg]);
            }
        } finally {
            setIsTyping(false);
        }
    };

    const visibleMessages = messages.filter(m => !m.is_hidden);

    const presets = [
        { icon: <Briefcase className="w-4 h-4" />, label: "Start Business", query: "Is this a good time to start a business based on my Dasha?" },
        {
            icon: <Heart className="w-4 h-4" />, label: "Compatibility", action: () => {
                if (!primaryProfile) {
                    alert("Please select a primary profile first.");
                    openProfileSelector('primary');
                } else if (secondaryProfile) {
                    handleSend(`Analyze the detailed compatibility between ${primaryProfile.name} and ${secondaryProfile.name}.\n\nFocus on:\n1. Dasha Sandhi (Timeline overlaps)\n2. Ego Conflicts (Sun/Moon positions)\n3. Long-term Stability\n4. Any "Karmic Debt" indicated by Saturn/Rahu.`);
                } else {
                    openProfileSelector('secondary');
                }
            }
        },
        { icon: <Activity className="w-4 h-4" />, label: "Health Outlook", query: "What does my chart say about health and vitality?" },
        { icon: <Sparkles className="w-4 h-4" />, label: "General Prediction", query: "Give me a general prediction based on my Lagna and Moon sign." }
    ];

    if (!mounted) return null;

    return (
        <main className="fixed inset-x-0 bottom-0 top-[56px] bg-slate-50 flex flex-col items-center z-0 h-[calc(100dvh-56px)]">

            <ProfileSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleProfileSelect}
                title={modalMode === 'primary' ? "Select Main Profile" : "Select Partner Profile"}
            />

            {/* Vibe Check Loading Overlay */}
            {validatingVibeCheck && (
                <div className="fixed inset-0 bg-white/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-4 text-center">
                    <div className="relative w-20 h-20 mb-8">
                        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                        <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Syncing Cosmic Data</h2>
                    <p className="text-slate-500 font-medium animate-pulse">Calculating precision planetary positions...</p>
                </div>
            )}

            {/* Pay Modal */}
            {showPayModal && (
                <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center"
                    >
                        {paymentSuccess ? (
                            <div className="text-center py-2">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                    <Check className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
                                <p className="text-slate-500 mb-8">10 credits have been added to your account instantly.</p>
                                <button
                                    onClick={() => { setPaymentSuccess(false); setShowPayModal(false); }}
                                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Continue Chatting
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                    <Coins className="w-8 h-8" />
                                </div>

                                {(credits ?? 0) <= 0 ? (
                                    <>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Out of Credits</h2>
                                        <p className="text-slate-500 mb-6">You have used your free messages. Recharge now to continue talking to Parihaaram AI.</p>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Top Up Credits</h2>
                                        <p className="text-slate-500 mb-6">You have <span className="font-bold text-indigo-600">{credits}</span> credits remaining.</p>
                                    </>
                                )}

                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
                                    <div className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-1">Standard Pack</div>
                                    <div className="text-3xl font-bold text-indigo-600">₹{packConfig.price} <span className="text-sm font-medium text-indigo-400">/ {packConfig.credits} msgs</span></div>
                                </div>

                                <button
                                    disabled={credits === undefined}
                                    onClick={async () => {
                                        const isRazorpayEnabled = razorpayEnabled;

                                        if (!isRazorpayEnabled) {
                                            // SIMULATION MODE
                                            const success = await creditService.topUpCredits(packConfig.credits);
                                            if (success) {
                                                setCredits(prev => (prev || 0) + packConfig.credits);
                                                setPaymentSuccess(true);
                                            } else {
                                                alert("Recharge failed. Please try again.");
                                            }
                                            return;
                                        }

                                        // RAZORPAY MODE
                                        const res = await loadRazorpay();
                                        if (!res) {
                                            alert('Razorpay SDK failed to load. Are you online?');
                                            return;
                                        }

                                        // Create Order
                                        const orderRes = await fetch('/api/create-order', {
                                            method: 'POST',
                                            body: JSON.stringify({ amount: packConfig.price * 100 }), // In paise
                                        });
                                        const orderData = await orderRes.json();

                                        if (!orderRes.ok) {
                                            alert("Error creating order: " + (orderData.error || "Unknown"));
                                            return;
                                        }

                                        const options = {
                                            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                                            amount: orderData.amount,
                                            currency: orderData.currency,
                                            name: "Parihaaram AI",
                                            description: `${packConfig.credits} Credit Pack`,
                                            order_id: orderData.id,
                                            handler: async function (response: any) {
                                                const verifyRes = await fetch('/api/verify-payment', {
                                                    method: 'POST',
                                                    body: JSON.stringify({
                                                        orderCreationId: orderData.id,
                                                        razorpayPaymentId: response.razorpay_payment_id,
                                                        razorpaySignature: response.razorpay_signature,
                                                    }),
                                                });

                                                if (verifyRes.ok) {
                                                    const success = await creditService.topUpCredits(packConfig.credits);
                                                    if (success) {
                                                        setCredits(prev => (prev || 0) + packConfig.credits);
                                                        setPaymentSuccess(true);
                                                    } else {
                                                        alert("Payment verified but credit update failed. Contact support.");
                                                    }
                                                } else {
                                                    alert("Payment verification failed.");
                                                }
                                            },
                                            prefill: {
                                                name: primaryProfile?.name || "User",
                                                email: userEmail || undefined,
                                            },
                                            theme: {
                                                color: "#4f46e5",
                                            },
                                        };

                                        const paymentObject = new (window as any).Razorpay(options);
                                        paymentObject.open();
                                    }}
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/30"
                                >
                                    {(credits ?? 0) <= 0 ? `Pay ₹${packConfig.price} to Continue` : `Add ${packConfig.credits} Credits (₹${packConfig.price})`}
                                </button>
                                {(credits ?? 0) > 0 ? (
                                    <button
                                        onClick={() => setShowPayModal(false)}
                                        className="mt-3 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        Close
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        Back to Dashboard
                                    </button>
                                )}
                            </>
                        )}
                    </motion.div>
                </div>
            )}

            <div className="flex-1 w-full max-w-7xl mx-auto flex relative overflow-hidden bg-white border border-indigo-500/30 md:border-0 md:shadow-2xl md:ring-1 md:ring-slate-900/5 md:my-0 md:rounded-t-[2.5rem] md:h-full">

                {/* Mobile Overlay Backdrop */}
                <AnimatePresence>
                    {isMobile && isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar (History) */}
                <motion.div
                    initial={false}
                    animate={{
                        width: !isMobile ? (isSidebarOpen ? 300 : 0) : undefined,
                        x: isMobile ? (isSidebarOpen ? 0 : "-100%") : 0,
                        position: isMobile ? "absolute" : "relative"
                    }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className={`bg-white border-r border-slate-200 flex flex-col shrink-0 z-50 w-[280px] md:w-auto h-full absolute md:relative shadow-2xl md:shadow-none`}
                >
                    <div className="p-4 flex items-center justify-between border-b border-slate-100">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-slate-900 tracking-tight">Parihaaram</span>
                        </Link>
                        {isMobile && (
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="p-3">
                        <button
                            onClick={() => createNewChat()}
                            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 hover:border-indigo-300 px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm group"
                        >
                            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            New Chat
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
                        {chats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => { setCurrentChatId(chat.id); if (isMobile) setIsSidebarOpen(false); }}
                                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${currentChatId === chat.id ? 'bg-white shadow-md border border-slate-100 ring-1 ring-slate-50' : 'hover:bg-slate-100/80 border border-transparent'}`}
                            >
                                <MessageSquare className={`w-4 h-4 shrink-0 ${currentChatId === chat.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${currentChatId === chat.id ? 'text-slate-900' : 'text-slate-600'}`}>
                                        {chat.title}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate">
                                        {new Date(chat.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => deleteChat(e, chat.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col relative bg-white w-full h-full">

                    {/* Header - Clean and Compact */}
                    <header className="absolute top-0 inset-x-0 z-20 flex flex-col bg-white/90 backdrop-blur-lg border-b border-slate-100 shadow-sm">
                        <div className="px-4 py-2.5 md:px-5 md:py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
                                >
                                    <Sidebar className="w-5 h-5" />
                                </button>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 text-sm leading-none">AI Astrologer</span>
                                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Credit Pill */}
                                <button
                                    onClick={() => setShowPayModal(true)}
                                    className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm"
                                >
                                    <Coins className="w-3.5 h-3.5" />
                                    <span>
                                        {credits !== null
                                            ? (credits > 999 ? '999+' : credits)
                                            : '-'
                                        }
                                    </span>
                                </button>

                                <button
                                    onClick={() => createNewChat()}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-indigo-600 text-white transition-all shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95"
                                    title="New Chat"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>

                                <Link
                                    href="/dashboard"
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors border border-slate-200 shadow-sm"
                                    title="Exit Chat"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Active Context Bar */}
                        <div className="px-4 md:px-5 pb-2.5 flex overflow-x-auto gap-2 items-center flex-nowrap scrollbar-hide">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1 shrink-0">Context:</span>

                            <button
                                onClick={() => openProfileSelector('primary')}
                                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${primaryProfile ? 'bg-indigo-50 border-indigo-200 text-indigo-800 shadow-sm' : 'bg-white border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-600'}`}
                            >
                                <User className="w-3.5 h-3.5" />
                                {primaryProfile ? primaryProfile.name : "Select Profile"}
                            </button>

                            {primaryProfile && (
                                <>
                                    <span className="text-slate-300 text-xs shrink-0">+</span>
                                    {secondaryProfile ? (
                                        <button
                                            onClick={() => openProfileSelector('secondary')}
                                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-pink-50 border-pink-200 text-pink-800 shadow-sm transition-all"
                                        >
                                            <Users className="w-3.5 h-3.5" />
                                            {secondaryProfile.name}
                                            <X className="w-3 h-3 ml-0.5 text-pink-400 hover:text-pink-700 cursor-pointer" onClick={(e) => { e.stopPropagation(); setSecondaryProfile(null); }} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => openProfileSelector('secondary')}
                                            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 hover:border-pink-400 hover:text-pink-500 hover:bg-pink-50 transition-all"
                                            title="Add Partner"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </header>

                    {/* Messages Area - Clean spacing */}
                    <div className={`flex-1 px-4 md:px-6 lg:px-8 pt-24 md:pt-28 pb-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 relative ${credits !== null && credits <= 0 ? 'overflow-hidden' : 'overflow-y-auto'}`}>

                        {/* LOADING STATE - INITIAL */}
                        {(credits === null) && (
                            <div className="h-full flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}

                        {loadingMessages && (
                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 backdrop-blur-sm">
                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                            </div>
                        )}

                        {/* BLOCKED/NO CREDITS STATE (Paywall Style) */}
                        {credits !== null && credits <= 0 && (
                            <div className="relative h-full overflow-hidden">
                                {/* Blurred Background Content (Teaser) */}
                                <div className="space-y-6 opacity-50 blur-[2px] pointer-events-none select-none px-4 md:px-0">
                                    {/* Show last few messages to give context, but fade them out */}
                                    {visibleMessages.slice(-3).map((msg, i) => (
                                        <div key={i} className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                                            <div className="w-8 h-8 rounded-xl bg-slate-200 shrink-0" />
                                            <div className={`p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600/20' : 'bg-slate-100'} w-full`}>
                                                <p className="line-clamp-2">{msg.content.substring(0, 100)}...</p>
                                                <div className="h-4 w-full bg-slate-200/50 rounded mt-2" />
                                                <div className="h-4 w-3/4 bg-slate-200/50 rounded mt-2" />
                                                <div className="h-4 w-5/6 bg-slate-200/50 rounded mt-2" />
                                            </div>
                                        </div>
                                    ))}
                                    {/* Fake extra content to fill space */}
                                    <div className="flex gap-3 max-w-3xl mr-auto">
                                        <div className="w-8 h-8 rounded-xl bg-slate-200 shrink-0" />
                                        <div className="bg-slate-50 p-4 rounded-2xl w-full h-40" />
                                    </div>
                                </div>

                                {/* Paywall Overlay */}
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-t from-white via-white/80 to-transparent">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 text-center max-w-sm mx-4"
                                    >
                                        <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                            <Coins className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Read the full prediction</h3>
                                        <p className="text-slate-500 mb-6 text-sm">
                                            Your free messages are over. Unlock the rest of this conversation and ask more questions.
                                        </p>
                                        <button
                                            onClick={() => {
                                                console.log("Recharge clicked from paywall");
                                                setShowPayModal(true);
                                            }}
                                            className="w-full py-3.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            Get Credits
                                        </button>
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        {/* ACTIVE STATE (Only when credits > 0) */}
                        {credits !== null && credits > 0 && (
                            <>
                                {visibleMessages.length === 0 && !isTyping ? (
                                    <div className="h-full flex flex-col justify-center items-center pb-16 text-center max-w-lg mx-auto px-4">
                                        {!primaryProfile ? (
                                            // STATE 1: No Profile Selected
                                            <div className="animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4">
                                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100">
                                                    <User className="w-10 h-10 text-indigo-600" />
                                                </div>
                                                <h1 className="text-2xl font-bold text-slate-900 mb-3">
                                                    Who is this reading for?
                                                </h1>
                                                <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                                                    Please select a birth profile to enable your personalized AI astrologer.
                                                </p>
                                                <button
                                                    onClick={() => openProfileSelector('primary')}
                                                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-sm font-bold uppercase tracking-wider shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
                                                >
                                                    Select Profile
                                                </button>
                                            </div>
                                        ) : (
                                            // STATE 2: Profile Selected, Ready to Chat
                                            <div className="animate-in fade-in zoom-in duration-500">
                                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-100">
                                                    <Sparkles className="w-8 h-8 text-indigo-600" />
                                                </div>
                                                <h1 className="text-xl font-medium text-slate-900 tracking-tight leading-tight mb-2">
                                                    Ask about <span className="font-bold text-indigo-600">{primaryProfile.name}</span>
                                                    {secondaryProfile && <span className="font-bold text-pink-600"> & {secondaryProfile.name}</span>}
                                                </h1>
                                                <p className="text-slate-500 text-sm mb-5">
                                                    Your AI astrologer is ready. Select a topic:
                                                </p>

                                                <div className="grid grid-cols-2 gap-3 w-full text-left">
                                                    {presets.map((p, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => p.action ? p.action() : handleSend(p.query)}
                                                            className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-100 rounded-xl transition-all group active:scale-[0.98]"
                                                        >
                                                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:text-white transition-all shrink-0">
                                                                {p.icon}
                                                            </div>
                                                            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{p.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    visibleMessages.map((msg, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={msg.id || i}
                                            className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${msg.role === 'ai' ? 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600' : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600'}`}>
                                                {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                            </div>

                                            <div className="flex flex-col gap-2 min-w-0">
                                                <div
                                                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-md shadow-lg shadow-indigo-500/20'
                                                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-md shadow-md'
                                                        }`}
                                                >
                                                    <ReactMarkdown
                                                        components={{
                                                            strong: ({ node, ...props }) => <span className="font-bold" {...props} />,
                                                            ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 space-y-1 my-2" {...props} />,
                                                            ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-4 space-y-1 my-2" {...props} />,
                                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                            li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}

                                {isTyping && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-3xl mr-auto">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mt-1">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                        <div className="bg-white border border-slate-200 p-4 rounded-3xl rounded-tl-sm shadow-sm flex gap-1">
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100" />
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
                                        </div>
                                    </motion.div>
                                )}

                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input Area - Premium Design */}
                    {primaryProfile ? (
                        <div className="px-4 md:px-6 pb-4 pt-2 shrink-0 max-w-4xl mx-auto w-full z-10 relative">

                            {/* Suggestion Prompts or Preset Pills */}
                            {!isTyping && (
                                <div className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
                                    {suggestionPrompts.length > 0 ? (
                                        // Show contextual suggestions after AI response
                                        <>
                                            {suggestionPrompts.map((suggestion, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        handleSend(suggestion);
                                                        setSuggestionPrompts([]); // Clear after use
                                                    }}
                                                    className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-full text-xs font-bold shadow-sm transition-all whitespace-nowrap"
                                                >
                                                    <Sparkles className="w-3 h-3" />
                                                    <span>{suggestion}</span>
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setSuggestionPrompts([])}
                                                className="shrink-0 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                                                title="Clear suggestions"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        // Show preset pills when no suggestions
                                        presets.slice(0, 3).map((p, i) => (
                                            <button
                                                key={i}
                                                onClick={() => p.action ? p.action() : handleSend(p.query)}
                                                className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-full text-xs font-bold shadow-sm transition-all whitespace-nowrap"
                                            >
                                                {p.icon}
                                                <span>{p.label}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}


                            <div className="relative bg-white rounded-2xl p-2 flex items-end gap-2 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={`Ask about ${primaryProfile.name}'s chart...`}
                                    className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-sm text-slate-900 placeholder:text-slate-400 min-h-[44px] max-h-[120px] py-3 px-3 resize-none caret-indigo-600 font-sans"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                />

                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isTyping}
                                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 mb-0.5 shadow-lg shadow-indigo-500/30"
                                >
                                    <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                                </button>
                            </div>
                            <p className="text-center text-[10px] text-slate-400 mt-2 font-medium tracking-wide">
                                AI Astrology predictions are for guidance only.
                            </p>
                        </div>
                    ) : (
                        <div className="p-6 bg-transparent text-center">
                            <p className="text-sm text-slate-400 font-medium italic">
                                Select a profile above to start chatting
                            </p>
                        </div>
                    )}
                </div>
            </div >
        </main >
    );

}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Loading AI...</p>
                </div>
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}
