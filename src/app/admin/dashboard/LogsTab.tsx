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
    // Users List State
    const [recentUsers, setRecentUsers] = useState<{ userId: string, lastActive: string, messageCount: number }[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [usersMap, setUsersMap] = useState<Record<string, { email: string, name: string }>>({});

    // Chat View State
    const [userLogs, setUserLogs] = useState<ArchiveLog[]>([]);
    const [loadingChat, setLoadingChat] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // 1. Initial Setup: Fetch Users & Recent Chatters
    useEffect(() => {
        const fetchInitialData = async () => {
            // A. Fetch Users Map
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

            // B. Fetch Recent Chatters
            fetchRecentChatters();
        };

        fetchInitialData();

        // 2. Realtime Subscription
        const archiveChannel = supabase
            .channel('admin-archives-monitor')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_logs' }, (payload) => {
                const newLog = payload.new as ArchiveLog;

                // Update active chat if viewing this user
                if (selectedUserId === newLog.user_id) {
                    setUserLogs(prev => [...prev, newLog]);
                }

                // Update Sidebar List (Bump user to top)
                setRecentUsers(prev => {
                    const filtered = prev.filter(u => u.userId !== newLog.user_id);
                    const existingCount = prev.find(u => u.userId === newLog.user_id)?.messageCount || 0;
                    return [{ userId: newLog.user_id, lastActive: newLog.created_at, messageCount: existingCount + 1 }, ...filtered];
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(archiveChannel);
        };
    }, [selectedUserId]);

    const fetchRecentChatters = async () => {
        // Fetch last 1000 logs to find active users
        const { data, error } = await supabase
            .from('chat_logs')
            .select('user_id, created_at')
            .order('created_at', { ascending: false })
            .limit(1000);

        if (!error && data) {
            const uniqueUsers = new Map<string, { userId: string, lastActive: string, count: number }>();

            data.forEach(log => {
                // Safe access to user_id
                const uid = log.user_id || 'unknown';
                if (!uniqueUsers.has(uid)) {
                    uniqueUsers.set(uid, { userId: uid, lastActive: log.created_at, count: 1 });
                } else {
                    const u = uniqueUsers.get(uid)!;
                    u.count++;
                    // keep earliest 'lastActive' which is actually most recent since we iterated desc? Yes.
                }
            });

            setRecentUsers(Array.from(uniqueUsers.values()));
        }
    };

    // 3. Fetch specific user logs when selected
    useEffect(() => {
        if (!selectedUserId) return;

        const loadUserChat = async () => {
            setLoadingChat(true);
            const { data, error } = await supabase
                .from('chat_logs')
                .select('*')
                .eq('user_id', selectedUserId)
                .order('created_at', { ascending: true }) // Chronological for chat
                .limit(100); // Last 100 messages

            if (!error && data) {
                setUserLogs(data);
            }
            setLoadingChat(false);
        };

        loadUserChat();
    }, [selectedUserId]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [userLogs]);

    return (
        <div className="h-[calc(100vh-140px)] flex bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Sidebar: User List */}
            <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50 ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>

                {/* Header */}
                <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-900" />
                        Active Users
                    </h3>
                    <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold">
                        {recentUsers.length} Recent
                    </div>
                </div>

                {/* Users List */}
                <div className="flex-1 overflow-y-auto">
                    {recentUsers.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">No recent chats found</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentUsers.map(u => {
                                const userInfo = usersMap[u.userId];
                                const isSelected = selectedUserId === u.userId;
                                return (
                                    <button
                                        key={u.userId}
                                        onClick={() => setSelectedUserId(u.userId)}
                                        className={`w-full p-4 text-left hover:bg-white transition-all group ${isSelected ? 'bg-white border-l-4 border-l-indigo-600 shadow-sm' : 'border-l-4 border-l-transparent text-slate-500 hover:text-slate-800'}`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-xs font-bold truncate pr-2 ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                                {userInfo?.name || 'User ' + u.userId.slice(0, 4)}
                                            </span>
                                            <span className="text-[10px] opacity-50 whitespace-nowrap">
                                                {new Date(u.lastActive).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-[10px] opacity-70 truncate max-w-[150px]">
                                                {userInfo?.email || 'No email'}
                                            </p>
                                            <span className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded-full font-medium">
                                                {u.messageCount > 50 ? '50+' : u.messageCount} msgs
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col bg-white h-full ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between shadow-sm z-10 min-h-[60px] bg-white">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedUserId(null)} className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-lg">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        {selectedUserId ? (
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    {usersMap[selectedUserId]?.name || 'User #' + selectedUserId.slice(0, 4)}
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px] uppercase">
                                        Active
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {usersMap[selectedUserId]?.email || 'ID: ' + selectedUserId}
                                </p>
                            </div>
                        ) : (
                            <h3 className="text-sm font-bold text-slate-400">Select a user to view conversation</h3>
                        )}
                    </div>
                </div>

                {/* Chat Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                    {selectedUserId ? (
                        loadingChat ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                            </div>
                        ) : userLogs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
                                <p>No logs found for this user</p>
                            </div>
                        ) : (
                            <>
                                <div className="text-center pb-4">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                                        Start of recorded history
                                    </span>
                                </div>

                                {userLogs.map((log) => (
                                    <div key={log.id} className="space-y-6">
                                        {/* User Message */}
                                        <ChatBubble role="user" content={log.user_message} time={log.created_at} />

                                        {/* AI Response */}
                                        <div className="relative group">
                                            <ChatBubble role="ai" content={log.ai_response} time={log.created_at} />

                                            {/* Context Peek on Hover */}
                                            {log.context_snapshot && (
                                                <div className="ml-12 mt-1">
                                                    <details className="inline-block">
                                                        <summary className="text-[9px] text-indigo-400 cursor-pointer hover:text-indigo-600 font-medium select-none list-none flex items-center gap-1">
                                                            <Terminal className="w-3 h-3" /> Debug Context
                                                        </summary>
                                                        <pre className="mt-2 p-3 bg-slate-900 rounded-lg text-amber-500 text-[9px] font-mono whitespace-pre-wrap max-w-lg shadow-xl relative z-20">
                                                            {JSON.stringify(log.context_snapshot, null, 2)}
                                                        </pre>
                                                    </details>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <User className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-sm font-bold uppercase tracking-widest">Select a user from the sidebar</p>
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
