"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import {
    Send, Bot, User, ArrowLeft, Globe,
    Lightbulb, MoreHorizontal, ArrowUp, Sidebar, CircleUser,
    Plus, MessageSquare, Trash2, X, Sparkles, Users, Briefcase, Heart, Activity, Coins, Check, Loader2
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

    // Profile Lookup Map (to resolve IDs to Objects/Names)
    const [savedProfiles, setSavedProfiles] = useState<SavedHoroscope[]>([]);

    // Context State
    const [primaryProfile, setPrimaryProfile] = useState<SavedHoroscope | null>(null);
    const [secondaryProfile, setSecondaryProfile] = useState<SavedHoroscope | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'primary' | 'secondary'>('primary');
    const [isTyping, setIsTyping] = useState(false);

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

    // Auto-Start Check (New User from Landing)
    useEffect(() => {
        const isNewUser = searchParams.get('new') === 'true';
        if (isNewUser && userId && savedProfiles.length > 0) {
            // Find latest profile and start chat
            // Avoid double creation
            const hasRecentEmptyChat = chats.length > 0 && chats[0].title === "New Session" && (new Date().getTime() - new Date(chats[0].created_at).getTime() < 10000);
            if (!hasRecentEmptyChat) {
                const latest = savedProfiles[0];
                // Create new chat with this profile
                createNewChatWithProfile(latest);
                router.replace('/chat');
            }
        }
    }, [searchParams, userId, savedProfiles]);

    const createNewChatWithProfile = async (profile: SavedHoroscope) => {
        if (!userId) return;
        try {
            const newSession = await chatService.createSession(userId, "New Session", profile.id);
            setChats(prev => [newSession, ...prev]);
            setCurrentChatId(newSession.id);
            // Add system/greeting message
            await chatService.addMessage(newSession.id, 'ai', "Hello! I am Parihaaram AI. I see you've selected **" + profile.name + "**. How can I help you regarding this chart today?");
            // Refresh logic handled by setCurrentChatId -> useEffect
        } catch (e) {
            console.error(e);
        }
    };

    const createNewChat = async (initialMessage?: string) => {
        if (!userId) return;
        try {
            const newSession = await chatService.createSession(userId, "New Session");
            setChats(prev => [newSession, ...prev]);
            setCurrentChatId(newSession.id);

            // Add Greeting
            await chatService.addMessage(newSession.id, 'ai', "Hello! I am Parihaaram AI. I can analyze birth charts and compatibility.\n\nTo begin, please tell me **which profile** you would like to analyze today?");

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
        if (!currentChatId || !userId) return;

        const isPrimary = modalMode === 'primary';

        try {
            // Update Session in DB
            if (isPrimary) {
                await chatService.updateSessionProfiles(currentChatId, profile.id, undefined);
                setPrimaryProfile(profile);
            } else {
                await chatService.updateSessionProfiles(currentChatId, undefined, profile.id);
                setSecondaryProfile(profile);
            }

            // User Message
            const content = isPrimary
                ? `I've selected **${profile.name}**'s profile.`
                : `I've selected **${profile.name}** as the partner profile.`;

            await chatService.addMessage(currentChatId, 'user', content);

            // Refresh Messages (Optimistic update possible, but fetch is safer for consistent ID)
            // Let's do optimistic for speed
            const optimMsg: ChatMessage = {
                id: Date.now().toString(),
                role: 'user',
                content,
                created_at: new Date().toISOString(),
                is_hidden: false
            };
            setMessages(prev => [...prev, optimMsg]);

            // Trigger AI
            setTimeout(() => {
                if (isPrimary) {
                    handleSend(`Analyze ${profile.name}'s chart and provide a detailed 'Life Prediction' covering:
1. Core Nature & Personality
2. Current Emotional State
3. Best Career Paths
4. Marriage & Relationship Outlook
5. Relationship with Parents

At the end, please list 3 specific follow-up questions I can ask to elaborate on these topics.`, true, { p1: profile });
                } else {
                    handleSend(`Compare ${primaryProfile?.name} and ${profile.name} for compatibility.`, true, { p1: primaryProfile || undefined, p2: profile });
                }
            }, 500);

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
            const aiMsg = await chatService.addMessage(targetChatId, 'ai', response.reply);

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
        <main className="fixed inset-x-0 bottom-0 top-[120px] md:top-[140px] bg-slate-50 flex flex-col items-center z-0 md:px-4 h-[calc(100dvh-120px)] md:h-auto">

            <ProfileSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleProfileSelect}
                title={modalMode === 'primary' ? "Select Main Profile" : "Select Partner Profile"}
            />

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
                            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-30"
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
                    className={`bg-slate-50/50 backdrop-blur-xl border-r border-slate-200 flex flex-col shrink-0 h-full z-40 w-[280px] md:w-auto h-full absolute md:relative`}
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

                    {/* Header */}
                    <header className="flex flex-col border-b border-slate-50 z-10 shrink-0 bg-white">
                        <div className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-500 transition-colors"
                                >
                                    <Sidebar className="w-5 h-5" />
                                </button>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 text-sm md:text-base leading-none">AI Astrologer</span>
                                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                    onClick={() => setShowPayModal(true)}
                                    className="flex items-center gap-1.5 sm:gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                    <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>{credits !== null ? credits : '-'} <span className="hidden sm:inline">Credits</span></span>
                                </button>

                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 sm:px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap"
                                >
                                    End <span className="hidden sm:inline">Chat</span>
                                </button>
                            </div>
                        </div>

                        {/* Active Context Bar */}
                        <div className="px-4 md:px-6 pb-3 pt-0 flex overflow-x-auto gap-2 items-center flex-nowrap scrollbar-hide">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2 shrink-0 hidden xs:block">Context:</span>

                            <button
                                onClick={() => openProfileSelector('primary')}
                                className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${primaryProfile ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-white border-dashed border-slate-300 text-slate-400 hover:border-indigo-300 hover:text-indigo-600'}`}
                            >
                                <User className="w-3.5 h-3.5" />
                                {primaryProfile ? primaryProfile.name : "Select Profile"}
                            </button>

                            {primaryProfile && (
                                <>
                                    <span className="text-slate-300 text-[10px] shrink-0">&</span>
                                    <button
                                        onClick={() => openProfileSelector('secondary')}
                                        className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${secondaryProfile ? 'bg-pink-50 border-pink-200 text-pink-900' : 'bg-white border-dashed border-slate-300 text-slate-400 hover:border-pink-300 hover:text-pink-600'}`}
                                    >
                                        <Users className="w-3.5 h-3.5" />
                                        {secondaryProfile ? secondaryProfile.name : "Add Partner"}
                                        {secondaryProfile && <X className="w-3 h-3 ml-1 text-pink-400 hover:text-pink-700" onClick={(e) => { e.stopPropagation(); setSecondaryProfile(null); }} />}
                                    </button>
                                </>
                            )}
                        </div>
                    </header>

                    {/* Messages Area */}
                    <div className={`flex-1 px-4 sm:px-8 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-100 relative ${credits !== null && credits <= 0 ? 'overflow-hidden' : 'overflow-y-auto'}`}>

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

                        {/* BLOCKED/NO CREDITS STATE */}
                        {credits !== null && credits <= 0 && (
                            <>
                                <div className="blur-md select-none pointer-events-none opacity-40 space-y-8" aria-hidden="true">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className={`flex gap-4 max-w-2xl ${i % 2 === 0 ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                                            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                                            <div className={`p-5 rounded-3xl w-full h-32 ${i % 2 === 0 ? 'bg-indigo-600' : 'bg-white border border-slate-100'}`} />
                                        </div>
                                    ))}
                                </div>

                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 text-center max-w-sm mx-4 ring-1 ring-black/5"
                                    >
                                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                                            <Coins className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Out of Credits</h3>
                                        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                                            Your session has ended. To reveal the chat history and continue asking questions, please top up your credits.
                                        </p>
                                        <button
                                            onClick={() => setShowPayModal(true)}
                                            className="w-full py-3.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-slate-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            Recharge to Unlock
                                        </button>
                                    </motion.div>
                                </div>
                            </>
                        )}

                        {/* ACTIVE STATE */}
                        {credits !== null && credits > 0 && (
                            <>
                                {visibleMessages.length === 0 ? (
                                    <div className="h-full flex flex-col justify-center items-center pb-20 text-center max-w-lg mx-auto px-4">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 sm:mb-8">
                                            <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
                                        </div>
                                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-slate-900 tracking-tight leading-tight mb-4">
                                            How can <span className="text-indigo-600">stars</span><br />guide you today?
                                        </h1>
                                        <p className="text-slate-500 text-sm sm:text-base mb-8">
                                            Start by selecting a profile to get personalized insights based on Lagna, Dasha, and more.
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                            {presets.map((p, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => p.action ? p.action() : handleSend(p.query)}
                                                    className="flex items-center gap-3 p-4 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 rounded-xl text-left transition-all group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        {p.icon}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-900">{p.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    visibleMessages.map((msg, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={msg.id || i}
                                            className={`flex gap-3 sm:gap-4 max-w-[90%] sm:max-w-2xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                                                {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <div
                                                    className={`p-4 sm:p-5 rounded-3xl text-sm sm:text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                                                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                                                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-md'
                                                        }`}
                                                >
                                                    <ReactMarkdown
                                                        components={{
                                                            strong: ({ node, ...props }) => <span className="font-bold" {...props} />,
                                                            ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 space-y-1" {...props} />,
                                                            ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-4 space-y-1" {...props} />,
                                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>

                                                {/* In-Chat Actions */}
                                                {msg.role === 'ai' && shouldShowProfileButton(msg.content) && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                                                        <button
                                                            onClick={() => openProfileSelector(shouldShowPartnerButton(msg.content) ? 'secondary' : 'primary')}
                                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-indigo-200"
                                                        >
                                                            <User className="w-4 h-4" />
                                                            {shouldShowPartnerButton(msg.content) ? "Select Partner" : "Select Profile"}
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                )}

                                {isTyping && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-3xl mr-auto">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mt-1">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                        <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-sm shadow-md flex gap-1">
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100" />
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
                                        </div>
                                    </motion.div>
                                )}

                                <div className="pt-20 pb-4">
                                    <Footer />
                                </div>

                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 sm:p-6 bg-white shrink-0 max-w-4xl mx-auto w-full">
                        <div className="relative bg-slate-50 rounded-[2rem] p-2 pr-2 flex items-end gap-2 shadow-inner border border-slate-100 focus-within:border-indigo-200 focus-within:ring-4 focus-within:ring-indigo-50/50 transition-all">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={primaryProfile ? `Ask about ${primaryProfile.name}'s chart...` : "Ask a question..."}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 min-h-[44px] max-h-[120px] py-2.5 px-2 resize-none"
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
                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 mb-0.5 shadow-lg shadow-indigo-500/20"
                            >
                                <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                            </button>
                        </div>
                        <p className="text-center text-[9px] sm:text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-widest">
                            AI Astrology predictions are for guidance only.
                        </p>
                    </div>
                </div>
            </div>
        </main>
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
