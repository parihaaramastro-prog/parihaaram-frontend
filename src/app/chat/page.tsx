"use client";

import { useState, useEffect, useRef } from "react";
import {
    Send, Bot, User, ArrowLeft, Globe,
    Lightbulb, MoreHorizontal, ArrowUp, Sidebar, CircleUser,
    Plus, MessageSquare, Trash2, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Message {
    role: 'user' | 'ai';
    content: string;
    timestamp: number;
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    updatedAt: number;
}

export default function ChatPage() {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Sync with hydration
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('horoscope_chats');
        if (stored) {
            setChats(JSON.parse(stored));
        } else {
            createNewChat();
        }

        const checkMobile = () => {
            const mobile = window.innerWidth < 1024; // lg breakpoint
            setIsMobile(mobile);
            if (mobile) setIsSidebarOpen(false);
            else setIsSidebarOpen(true);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (mounted && chats.length > 0) {
            localStorage.setItem('horoscope_chats', JSON.stringify(chats));
        }
    }, [chats, mounted]);

    const getCurrentChat = () => chats.find(c => c.id === currentChatId);

    const createNewChat = () => {
        const newChat: ChatSession = {
            id: Date.now().toString(),
            title: "New Chat",
            messages: [],
            updatedAt: Date.now()
        };
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        if (isMobile) setIsSidebarOpen(false);
    };

    const deleteChat = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setChats(prev => prev.filter(c => c.id !== id));
        if (currentChatId === id) {
            setCurrentChatId(null);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [currentChatId, chats]);

    const handleSend = (text: string = input) => {
        if (!text.trim() || !currentChatId) return;

        const timestamp = Date.now();
        const userMsg: Message = { role: 'user', content: text, timestamp };

        setChats(prev => prev.map(chat => {
            if (chat.id === currentChatId) {
                const updatedMessages = [...chat.messages, userMsg];
                const title = chat.messages.length === 0 ? text.slice(0, 30) + (text.length > 30 ? '...' : '') : chat.title;
                return { ...chat, messages: updatedMessages, title, updatedAt: timestamp };
            }
            return chat;
        }));

        setInput("");

        setTimeout(() => {
            const aiMsg: Message = {
                role: 'ai',
                content: "I'm analyzing your chart aspects based on that question. Give me a moment to consult the stars...",
                timestamp: Date.now()
            };

            setChats(prev => prev.map(chat => {
                if (chat.id === currentChatId) {
                    return { ...chat, messages: [...chat.messages, aiMsg] };
                }
                return chat;
            }));
        }, 1000);
    };

    const currentMessages = getCurrentChat()?.messages || [];
    const suggestions = [
        "What's my career outlook?",
        "Relationship compatibility?",
        "Any health warnings?",
        "Lucky colors for today?"
    ];

    if (!mounted) return null;

    return (
        // Adjusted top padding to match RootLayout (pt-32 md:pt-40) and ensure full height without overlaying Navbar irregularly
        <main className="fixed inset-x-0 bottom-0 top-[120px] md:top-[160px] bg-slate-50 flex flex-col items-center z-0 md:px-6">

            <div className="flex-1 w-full max-w-[1400px] mx-auto flex relative overflow-hidden bg-white md:shadow-2xl md:ring-1 md:ring-slate-900/5 md:my-6 md:rounded-[2.5rem] md:h-[calc(100%-3rem)]">

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
                            onClick={createNewChat}
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
                                        {new Date(chat.updatedAt).toLocaleDateString()}
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
                    <header className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between border-b border-slate-50 z-10 shrink-0">
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
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                            End Chat
                        </button>
                    </header>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-100">
                        {currentMessages.length === 0 ? (
                            <div className="h-full flex flex-col justify-center items-center pb-20 text-center max-w-lg mx-auto px-4">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 sm:mb-8">
                                    <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
                                </div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-slate-900 tracking-tight leading-tight mb-4">
                                    How can <span className="text-indigo-600">stars</span><br />guide you today?
                                </h1>
                                <p className="text-slate-500 text-sm sm:text-base">Ask about career, love, or health.</p>
                            </div>
                        ) : (
                            currentMessages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i}
                                    className={`flex gap-3 sm:gap-4 max-w-[95%] sm:max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                                        {msg.role === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    </div>

                                    <div
                                        className={`p-4 sm:p-5 rounded-3xl text-sm sm:text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-sm'
                                            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-md'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions & Input */}
                    <div className="p-4 sm:p-6 bg-white shrink-0 max-w-4xl mx-auto w-full">
                        {currentMessages.length === 0 && (
                            <div className="pb-4 flex gap-2 overflow-x-auto scrollbar-hide justify-start md:justify-center -mx-4 px-4 md:mx-0 md:px-0">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(s)}
                                        className="shrink-0 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-slate-600 transition-all whitespace-nowrap"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="relative bg-slate-50 rounded-[2rem] p-2 pr-2 flex items-end gap-2 shadow-inner border border-slate-100 focus-within:border-indigo-200 focus-within:ring-4 focus-within:ring-indigo-50/50 transition-all">


                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your horoscope..."
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
                                disabled={!input.trim()}
                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 mb-0.5 shadow-lg shadow-indigo-500/20"
                            >
                                <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                            </button>
                        </div>
                        <p className="text-center text-[9px] sm:text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-widest">
                            AI Astrologer can make mistakes.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
