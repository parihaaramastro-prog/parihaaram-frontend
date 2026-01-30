"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { MessageSquare, User, Bot, Loader2, Archive, History, ArrowLeft, Terminal } from "lucide-react";

interface ArchiveLog {
    id: number;
    user_id: string;
    model: string;
    user_message: string;
    ai_response: string;
    created_at: string;
    context_snapshot?: any;
}

export default function LogsTab() {
    // Archives State
    const [archives, setArchives] = useState<ArchiveLog[]>([]);
    const [selectedArchive, setSelectedArchive] = useState<ArchiveLog | null>(null);
    const [loadingArchives, setLoadingArchives] = useState(false);
    const [archivePage, setArchivePage] = useState(0);
    const [hasMoreArchives, setHasMoreArchives] = useState(true);

    // Shared State
    const [usersMap, setUsersMap] = useState<Record<string, { email: string, name: string }>>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // 1. Initial Setup: Fetch Users & Archives
    useEffect(() => {
        const fetchInitialData = async () => {
            // Fetch Users Map
            try {
                const res = await fetch('/api/admin/users');
                const data = await res.json();
                const map: Record<string, { email: string, name: string }> = {};
                if (data.users) {
                    data.users.forEach((u: any) => {
                        map[u.id] = { email: u.email, name: u.full_name };
                    });
                }
                setUsersMap(map);
            } catch (e) {
                console.warn("Could not fetch user details", e);
            }

            fetchArchives();
        };

        fetchInitialData();

        // Realtime Subscription for new logs
        const archiveChannel = supabase
            .channel('admin-archives-monitor')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_logs' }, (payload) => {
                setArchives(prev => [payload.new as ArchiveLog, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(archiveChannel);
        };
    }, []);

    // Background polling to ensure freshness
    useEffect(() => {
        const pollLatestLogs = async () => {
            const { data, error } = await supabase
                .from('chat_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .range(0, 19);

            if (!error && data) {
                setArchives(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newLogs = data.filter(log => !existingIds.has(log.id));

                    if (newLogs.length > 0) {
                        return [...newLogs, ...prev];
                    }
                    return prev;
                });
            }
        };

        const intervalId = setInterval(pollLatestLogs, 3000);
        return () => clearInterval(intervalId);
    }, []);

    const fetchArchives = async (page = 0, append = false) => {
        if (page === 0) setLoadingArchives(true);

        const PAGE_SIZE = 50;
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await supabase
            .from('chat_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .range(from, to);

        if (!error && data) {
            if (append) {
                setArchives(prev => [...prev, ...data]);
            } else {
                setArchives(data);
            }
            setHasMoreArchives(data.length === PAGE_SIZE);
        }
        setLoadingArchives(false);
    };

    // Scroll effect
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedArchive]);

    const handleLoadMoreArchives = () => {
        const nextPage = archivePage + 1;
        setArchivePage(nextPage);
        fetchArchives(nextPage, true);
    };

    return (
        <div className="h-[calc(100vh-140px)] flex bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Sidebar */}
            <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50 ${selectedArchive ? 'hidden md:flex' : 'flex'}`}>

                {/* Header */}
                <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-slate-900" />
                        System Logs
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase">Live</span>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto">
                    {loadingArchives && archives.length === 0 ? (
                        <div className="p-8 text-center"><Loader2 className="w-6 h-6 text-slate-400 animate-spin mx-auto" /></div>
                    ) : (
                        <div className="divide-y divide-slate-100 pb-4">
                            {archives.map(log => {
                                const user = usersMap[log.user_id];
                                return (
                                    <button
                                        key={log.id}
                                        onClick={() => setSelectedArchive(log)}
                                        className={`w-full p-4 text-left hover:bg-white transition-all ${selectedArchive?.id === log.id ? 'bg-white border-l-4 border-l-slate-900 shadow-sm' : 'border-l-4 border-l-transparent'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-slate-900 truncate pr-2">
                                                {user?.name || 'User #' + log.user_id.slice(0, 4)}
                                            </span>
                                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 truncate mb-1.5">{log.user_message}</p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                            <History className="w-3 h-3" />
                                            <span className="truncate max-w-[120px]">{log.model}</span>
                                        </div>
                                    </button>
                                );
                            })}
                            {hasMoreArchives && (
                                <button
                                    onClick={handleLoadMoreArchives}
                                    className="w-full py-3 text-xs font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest text-center"
                                >
                                    Load More
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col bg-white h-full ${!selectedArchive ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between shadow-sm z-10 min-h-[60px]">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedArchive(null)} className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-lg">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        {selectedArchive ? (
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    {usersMap[selectedArchive.user_id]?.name || 'User'}
                                </h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    Log ID: #{selectedArchive.id}
                                </p>
                            </div>
                        ) : (
                            <h3 className="text-sm font-bold text-slate-400">Select a log entry</h3>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                    {selectedArchive ? (
                        <>
                            <ChatBubble role="user" content={selectedArchive.user_message} time={selectedArchive.created_at} />
                            <ChatBubble role="ai" content={selectedArchive.ai_response} time={selectedArchive.created_at} />

                            {/* Context for Archive */}
                            <div className="mt-8 pt-8 border-t border-slate-200">
                                <details className="group">
                                    <summary className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer list-none flex items-center gap-2 hover:text-slate-600">
                                        <span>▶</span> View Generation Context
                                    </summary>
                                    <pre className="mt-4 p-4 bg-slate-900 rounded-xl text-amber-500 text-[10px] font-mono overflow-x-auto">
                                        {JSON.stringify(selectedArchive.context_snapshot, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <Archive className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-sm font-bold uppercase tracking-widest">Select a log to view details</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    );
}

function ChatBubble({ role, content, time }: { role: string, content: string, time: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`flex gap-3 max-w-[80%] ${role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${role === 'user' ? 'bg-indigo-100 border-indigo-200' : 'bg-emerald-100 border-emerald-200'}`}>
                    {role === 'user' ? <User className="w-4 h-4 text-indigo-600" /> : <Bot className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className={`space-y-1 ${role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                        }`}>
                        <p className="whitespace-pre-wrap">{content}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 px-1">
                        {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
