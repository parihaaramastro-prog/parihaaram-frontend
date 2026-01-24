"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Settings, ShieldCheck, Grid,
    Database, Activity, Search, Filter,
    ArrowUpRight, Loader2, UserPlus, UserCheck, CheckCircle2, Clock,
    Mail, Shield, Trash2, MoreVertical, Info, AlertTriangle, X, MessageSquare, Briefcase, LogOut, Coins, Bot
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { consultationService } from "@/lib/services/consultation";
import { profileService, User } from "@/lib/services/profile";
import { settingsService } from "@/lib/services/settings";
import { creditService } from "@/lib/services/credits";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import Link from "next/link";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function AdminDashboard() {
    const router = useRouter();
    const [consultations, setConsultations] = useState<any[]>([]);
    const [astrologers, setAstrologers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, complete: 0 });
    const [metrics, setMetrics] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'consultations' | 'staff' | 'settings' | 'users' | 'ai-config'>('overview');

    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDestructive?: boolean;
        confirmText?: string;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
        isDestructive: false,
        confirmText: "Confirm"
    });

    // Users & Credits State
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [userCredits, setUserCredits] = useState<Record<string, number>>({});
    const [usersTabSearch, setUsersTabSearch] = useState("");
    const [selectedUserForCredits, setSelectedUserForCredits] = useState<User | null>(null);
    const [newCreditBalance, setNewCreditBalance] = useState<number>(0);
    const [updatingCredits, setUpdatingCredits] = useState(false);

    // Add Staff State
    const [searchEmail, setSearchEmail] = useState("");
    const [newStaffName, setNewStaffName] = useState("");
    const [newStaffEmail, setNewStaffEmail] = useState("");
    const [newStaffPassword, setNewStaffPassword] = useState("");
    const [addingStaff, setAddingStaff] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);
    const [addSuccess, setAddSuccess] = useState<string | null>(null);

    // Settings State
    const [razorpayEnabled, setRazorpayEnabled] = useState(false);
    const [packPrice, setPackPrice] = useState(49);
    const [packCredits, setPackCredits] = useState(10);
    const [aiModel, setAiModel] = useState<string>('gpt-4o');
    const [systemPrompt, setSystemPrompt] = useState("");
    const [isPromptActive, setIsPromptActive] = useState(true);
    const [chatLogs, setChatLogs] = useState<any[]>([]);
    const [selectedLog, setSelectedLog] = useState<any | null>(null);
    const [logSearch, setLogSearch] = useState("");
    const [logFilterUser, setLogFilterUser] = useState<string>("all");

    // Review State
    const [selectedReview, setSelectedReview] = useState<any | null>(null);
    const [reviewContent, setReviewContent] = useState("");
    const [publishing, setPublishing] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [conData, astroData] = await Promise.all([
                consultationService.getAllConsultations(),
                profileService.getAstrologers()
            ]);

            // Fetch Users from Admin API (includes Google OAuth users & Credits)
            const userRes = await fetch('/api/admin/users');
            const userData = await userRes.json();

            // Fetch Stats API
            const statsRes = await fetch('/api/admin/stats');
            const statsData = await statsRes.json();
            setMetrics(statsData);

            setConsultations(conData);
            setAstrologers(astroData);
            setAllUsers(userData.users || []);

            // Populate credits from user data directly
            const creditMap: Record<string, number> = {};
            if (userData.users) {
                userData.users.forEach((u: any) => { creditMap[u.id] = u.credits || 0; });
            }
            setUserCredits(creditMap);

            const supabase = createClient();
            const { data: logs } = await supabase.from('chat_logs').select('*').order('created_at', { ascending: false }).limit(100);
            setChatLogs(logs || []);

            const pending = conData.filter((c: any) => c.status === 'pending').length;
            const complete = conData.filter((c: any) => c.status === 'completed').length;
            setStats({ total: conData.length, pending, complete });
        } catch (error: any) {
            console.error("Terminal Sync Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        settingsService.getSettings().then(s => {
            setRazorpayEnabled(s.razorpay_enabled);
            setPackPrice(s.pack_price);
            setPackCredits(s.pack_credits);
            if (s.ai_model) setAiModel(s.ai_model);
            if (s.system_prompt) setSystemPrompt(s.system_prompt);
            if (s.is_prompt_active !== undefined) setIsPromptActive(s.is_prompt_active);
        }).catch(() => {
            console.warn("Settings table might need update");
        });
    }, []);

    const toggleRazorpay = async () => {
        try {
            const newState = !razorpayEnabled;
            setRazorpayEnabled(newState);
            await settingsService.updateSettings({ razorpay_enabled: newState });
        } catch (e: any) {
            alert("Settings Update Failed: " + e.message + "\n\nYou likely need to add columns to your 'app_settings' table.");
        }
    };

    const savePricing = async () => {
        try {
            await settingsService.updateSettings({
                pack_price: packPrice,
                pack_credits: packCredits
            });
            alert("Pricing configuration synced globally.");
        } catch (e: any) {
            alert(`Failed to save pricing: ${e.message}`);
        }
    };

    const saveModel = async () => {
        try {
            await settingsService.updateSettings({ ai_model: aiModel });
            alert("AI Model preference saved globally.");
        } catch (e: any) {
            console.error("Save Model Error:", e);
            if (e.message.includes("column")) {
                prompt("DATABASE SCHEMA UPDATE REQUIRED:\n\nCopy and run this SQL in your Supabase SQL Editor:",
                    "ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS ai_model TEXT DEFAULT 'gpt-4o';");
            } else {
                alert(`Failed to save model: ${e.message}`);
            }
        }
    };

    const savePrompt = async () => {
        try {
            await settingsService.updateSettings({ system_prompt: systemPrompt });
            alert("System Prompt updated successfully.");
        } catch (e: any) {
            console.error("Save Prompt Error:", e);
            if (e.message.includes("column")) {
                prompt("DATABASE SCHEMA UPDATE REQUIRED:\n\nCopy and run this SQL in your Supabase SQL Editor:",
                    "ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS system_prompt TEXT;");
            } else {
                alert(`Failed to save prompt: ${e.message}`);
            }
        }
    };

    const togglePromptActive = async () => {
        try {
            const newState = !isPromptActive;
            setIsPromptActive(newState);
            await settingsService.updateSettings({ is_prompt_active: newState });
        } catch (e: any) {
            alert("Settings Update Failed: " + e.message + "\n\nYou likely need to add 'is_prompt_active' column to your 'app_settings' table.");
        }
    };

    const handleUpdateCredits = async () => {
        if (!selectedUserForCredits) return;
        setUpdatingCredits(true);
        try {
            const response = await fetch('/api/admin/credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedUserForCredits.id,
                    credits: newCreditBalance
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Update failed");
            }

            setUserCredits(prev => ({ ...prev, [selectedUserForCredits.id]: newCreditBalance }));
            setSelectedUserForCredits(null);
            alert("Credits updated successfully.");
        } catch (e: any) {
            alert("Failed to update credits: " + e.message);
        } finally {
            setUpdatingCredits(false);
        }
    };

    const handleAssign = async (consultationId: string, astrologerId: string) => {
        try {
            await consultationService.assignAstrologer(consultationId, astrologerId);
            setConsultations(prev => prev.map(c =>
                c.id === consultationId
                    ? { ...c, assigned_astrologer_id: astrologerId, status: 'reviewing' }
                    : c
            ));
        } catch (error) {
            alert("Assignment failed.");
        }
    };

    const handleAddStaff = async () => {
        if (!searchEmail) return;
        setAddingStaff(true);
        setAddError(null);
        setAddSuccess(null);

        try {
            const user = await profileService.getUserByEmail(searchEmail);
            if (!user) {
                throw new Error("No user found with this identity. Ensure they have signed up first.");
            }
            if (user.role === 'astrologer') {
                throw new Error("Target identity already holds consultant clearance.");
            }

            await profileService.updateRole(user.id, 'astrologer');
            setAddSuccess(`Clearance granted to ${user.full_name || user.email}`);
            setSearchEmail("");
            fetchData();
        } catch (err: any) {
            setAddError(err.message);
        } finally {
            setAddingStaff(false);
        }
    };

    const handleCreateConsultant = async () => {
        if (!newStaffEmail || !newStaffPassword || !newStaffName) return;
        setAddingStaff(true);
        setAddError(null);
        setAddSuccess(null);

        try {
            const response = await fetch('/api/admin/create-astrologer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: newStaffEmail,
                    password: newStaffPassword,
                    fullName: newStaffName
                })
            });

            const result = await response.json();
            if (!result.success) throw new Error(result.error);

            setAddSuccess(`Consultant ${newStaffName} successfully provisioned.`);
            setNewStaffEmail("");
            setNewStaffPassword("");
            setNewStaffName("");
            fetchData();
        } catch (err: any) {
            setAddError(err.message);
        } finally {
            setAddingStaff(false);
        }
    };

    const handleRemoveStaff = (id: string) => {
        setConfirmationState({
            isOpen: true,
            title: "Revoke Consultant Clearance",
            message: "Are you sure you want to revoke all consultant clearances for this member?",
            isDestructive: true,
            confirmText: "Revoke Access",
            onConfirm: async () => {
                try {
                    await profileService.updateRole(id, 'customer');
                    fetchData();
                } catch (err) {
                    alert("Failed to revoke clearance.");
                }
            }
        });
    };

    const handleOpenReview = (con: any) => {
        setSelectedReview(con);
        setReviewContent(con.report_content || "");
    };

    const handlePublish = async () => {
        if (!selectedReview) return;
        setPublishing(true);
        try {
            await consultationService.publishReport(selectedReview.id, reviewContent);
            setSelectedReview(null);
            fetchData();
            alert("Report finalized and published to user.");
        } catch (error) {
            alert("Failed to publish report.");
        } finally {
            setPublishing(false);
        }
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    return (
        <main className="fixed inset-0 w-screen h-screen bg-slate-50 flex flex-col overflow-hidden selection:bg-indigo-100/50">
            {/* Background Pattern - subtle noise/grid */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>

            {/* Top Navigation Bar - Fixed */}
            <header className="shrink-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6 z-40 relative">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 uppercase tracking-widest leading-none">Command Center</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Pariharam Admin</p>
                    </div>
                </div>

                <nav className="flex items-center bg-slate-100/50 p-1.5 rounded-xl">
                    {[
                        { id: 'overview', label: 'Monitor' },
                        { id: 'consultations', label: 'Pipeline' },
                        { id: 'staff', label: 'Staff' },
                        { id: 'users', label: 'Users' },
                        { id: 'settings', label: 'Config' },
                        { id: 'ai-config', label: 'Intelligence' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                                : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-6 px-6 border-l border-slate-200 h-10">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inquiries</span>
                            <span className="text-lg font-bold text-slate-900 leading-none">{stats.total}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending</span>
                            <span className="text-lg font-bold text-amber-600 leading-none">{stats.pending}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Scrollable Main Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative z-10">
                <div className="max-w-[1600px] mx-auto space-y-6 pb-20">

                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && metrics && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="space-y-6"
                            >
                                {/* KPI Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-indigo-50 rounded-lg"><Activity className="w-5 h-5 text-indigo-600" /></div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Reports</p>
                                        </div>
                                        <p className="text-3xl font-bold text-slate-900">{metrics.overview.total_reports}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-emerald-50 rounded-lg"><MessageSquare className="w-5 h-5 text-emerald-600" /></div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Chats</p>
                                        </div>
                                        <p className="text-3xl font-bold text-slate-900">{metrics.overview.active_chats}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-amber-50 rounded-lg"><Users className="w-5 h-5 text-amber-600" /></div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Messages</p>
                                        </div>
                                        <p className="text-3xl font-bold text-slate-900">{metrics.overview.total_messages}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-purple-50 rounded-lg"><ArrowUpRight className="w-5 h-5 text-purple-600" /></div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Growth (7d)</p>
                                        </div>
                                        <p className="text-3xl font-bold text-slate-900">+{metrics.overview.growth_rate}</p>
                                    </div>
                                </div>

                                {/* Chart */}
                                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-8">Report Generation Velocity (30 Days)</h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={metrics.chart}>
                                                <defs>
                                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                                                />
                                                <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'consultations' && (
                            <motion.div
                                key="consultations"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
                            >
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                                            <Activity className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Consultation Queue</h2>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative group">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                placeholder="Search pipeline..."
                                                className="h-10 bg-white border border-slate-200 rounded-lg py-0 pl-10 pr-4 text-xs font-bold uppercase tracking-widest focus:border-indigo-600 transition-all outline-none w-56"
                                            />
                                        </div>
                                        <button onClick={fetchData} className="p-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                            <Loader2 className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="h-64 flex flex-col items-center justify-center space-y-3">
                                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Syncing Data...</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100 bg-slate-50/30">
                                                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Seeker</th>
                                                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Inquiry Context</th>
                                                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Expert Assigned</th>
                                                    <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {consultations.map((c) => (
                                                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="space-y-0.5">
                                                                <p className="text-sm font-bold text-slate-900">{c.users?.full_name}</p>
                                                                <p className="text-xs font-medium text-slate-400">{c.users?.email}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="space-y-1">
                                                                <div className="flex gap-1 flex-wrap">
                                                                    {c.categories.map((cat: string) => (
                                                                        <span key={cat} className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-bold uppercase">{cat}</span>
                                                                    ))}
                                                                </div>
                                                                <p className="text-xs text-slate-400 italic truncate max-w-[200px]">"{c.comments}"</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-widest border ${c.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                                                c.status === 'pending_admin' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                                                    c.status === 'reviewing' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                                                        'bg-amber-50 border-amber-100 text-amber-600'
                                                                }`}>
                                                                <div className={`w-2 h-2 rounded-full ${c.status === 'completed' ? 'bg-emerald-500' : c.status === 'pending_admin' ? 'bg-indigo-500' : 'bg-amber-500'}`} />
                                                                {c.status.replace('_', ' ')}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <select
                                                                value={c.assigned_astrologer_id || ""}
                                                                onChange={(e) => handleAssign(c.id, e.target.value)}
                                                                disabled={c.status === 'completed'}
                                                                className="h-8 bg-white border border-slate-200 rounded-lg px-2 text-[10px] font-bold uppercase tracking-wide focus:border-indigo-600 outline-none w-full max-w-[140px]"
                                                            >
                                                                <option value="">-- Select --</option>
                                                                {astrologers.map(a => (
                                                                    <option key={a.id} value={a.id}>{a.full_name}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {c.status === 'pending_admin' ? (
                                                                <button
                                                                    onClick={() => handleOpenReview(c)}
                                                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm"
                                                                >
                                                                    Review
                                                                </button>
                                                            ) : (
                                                                <button className="px-3 py-1.5 text-slate-300 hover:text-indigo-600 bg-transparent hover:bg-indigo-50 rounded-lg transition-all">
                                                                    <ArrowUpRight className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'staff' && (
                            <motion.div
                                key="staff"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                            >
                                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                                                <Users className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Staff Directory</h2>
                                        </div>
                                    </div>
                                    <div className="p-1">
                                        {astrologers.map(a => (
                                            <div key={a.id} className="p-3 hover:bg-slate-50 rounded-xl flex items-center justify-between group transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                        {a.full_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{a.full_name}</p>
                                                        <p className="text-xs text-slate-400">{a.email}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleRemoveStaff(a.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5 h-fit">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Add New Expert</h3>
                                    <div className="space-y-4">
                                        <input
                                            value={newStaffName}
                                            onChange={(e) => setNewStaffName(e.target.value)}
                                            placeholder="Full Name"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-indigo-600 outline-none"
                                        />
                                        <input
                                            value={newStaffEmail}
                                            onChange={(e) => setNewStaffEmail(e.target.value)}
                                            placeholder="Email Address"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-indigo-600 outline-none"
                                        />
                                        <input
                                            value={newStaffPassword}
                                            onChange={(e) => setNewStaffPassword(e.target.value)}
                                            placeholder="Temporary Password"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-indigo-600 outline-none"
                                        />
                                        <button
                                            onClick={handleCreateConsultant}
                                            disabled={addingStaff}
                                            className="w-full bg-slate-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all flex justify-center"
                                        >
                                            {addingStaff ? <Loader2 className="w-4 h-4 animate-spin" /> : "Provision Account"}
                                        </button>
                                        {addSuccess && <p className="text-xs text-emerald-600 font-bold text-center">{addSuccess}</p>}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'users' && (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
                            >
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">User Database</h2>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            value={usersTabSearch}
                                            onChange={(e) => setUsersTabSearch(e.target.value)}
                                            placeholder="Search users..."
                                            className="h-10 bg-white border border-slate-200 rounded-lg py-0 pl-10 pr-4 text-xs font-bold uppercase tracking-widest focus:border-indigo-600 transition-all outline-none w-64"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto max-h-[70vh]">
                                    <table className="w-full text-left">
                                        <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Identity</th>
                                                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                                                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Credits</th>
                                                <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Controls</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {allUsers.filter(u => !usersTabSearch || u.email.includes(usersTabSearch) || u.full_name?.includes(usersTabSearch)).map(u => (
                                                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-3">
                                                        <div className="space-y-0.5">
                                                            <p className="text-sm font-bold text-slate-900">{u.full_name || 'Guest'}</p>
                                                            <p className="text-xs text-slate-400">{u.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <span className="px-2.5 py-1 border rounded text-xs font-bold uppercase tracking-wide text-slate-500">{u.role}</span>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <span className="text-xs font-mono font-medium text-slate-700">{userCredits[u.id] || 0}</span>
                                                    </td>
                                                    <td className="px-6 py-3 text-right flex justify-end gap-2">
                                                        <button
                                                            onClick={() => { setSelectedUserForCredits(u); setNewCreditBalance(userCredits[u.id] || 0); }}
                                                            className="p-2 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                                                            title="Edit Credits"
                                                        >
                                                            <Coins className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                                            title="Block / Delete"
                                                            onClick={() => handleRemoveStaff(u.id)} // Reusing the destructive modal for simplicity or create new one
                                                        >
                                                            <Shield className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'settings' && (
                            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
                                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">Razorpay Payments</h3>
                                        <p className="text-xs text-slate-500">Toggle between live charging and simulation mode.</p>
                                    </div>
                                    <button
                                        onClick={toggleRazorpay}
                                        className={`w-14 h-8 rounded-full p-1 transition-colors ${razorpayEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${razorpayEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                                        <h3 className="text-base font-bold text-slate-900">Pricing Logic</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase">Pack Price (₹)</label>
                                                <input type="number" value={packPrice} onChange={e => setPackPrice(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-base font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase">Credits / Pack</label>
                                                <input type="number" value={packCredits} onChange={e => setPackCredits(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-base font-bold" />
                                            </div>
                                            <button onClick={savePricing} className="w-full py-3 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest">Update config</button>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                                        <h3 className="text-base font-bold text-slate-900">AI Model</h3>
                                        <div className="space-y-3">
                                            {['gpt-4o', 'gemini-2.0-flash', 'gemini-2.5-flash'].map(m => (
                                                <button key={m} onClick={() => setAiModel(m)} className={`w-full py-3 px-4 rounded-lg border text-left flex items-center justify-between ${aiModel === m ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-slate-200 text-slate-600'}`}>
                                                    <span className="text-xs font-bold uppercase tracking-widest">{m}</span>
                                                    {aiModel === m && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                                                </button>
                                            ))}
                                            <button onClick={saveModel} className="w-full py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest mt-2">Save Preference</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'ai-config' && (
                            <motion.div key="ai-config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-140px)] grid grid-cols-2 gap-6">
                                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">System Prompt</h3>
                                        <button onClick={savePrompt} className="px-4 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-bold uppercase tracking-widest">Save</button>
                                    </div>
                                    <textarea
                                        value={systemPrompt}
                                        onChange={e => setSystemPrompt(e.target.value)}
                                        className="flex-1 p-6 text-sm font-mono text-slate-800 resize-none outline-none leading-relaxed"
                                        placeholder="Define AI persona..."
                                    />
                                </div>
                                <div className="bg-slate-900 rounded-2xl shadow-sm flex flex-col overflow-hidden border border-slate-800">
                                    <div className="p-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Logs</h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        {chatLogs.map(log => (
                                            <div key={log.id} onClick={() => setSelectedLog(log)} className="p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 cursor-pointer">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[9px] font-bold text-indigo-400 uppercase">{log.user_id.slice(0, 8)}</span>
                                                    <span className="text-[9px] font-mono text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-300 line-clamp-2">{log.user_message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmationState.isOpen}
                onClose={() => setConfirmationState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmationState.onConfirm}
                title={confirmationState.title}
                message={confirmationState.message}
                isDestructive={confirmationState.isDestructive}
                confirmText={confirmationState.confirmText}
            />

            {/* Reusing existing Modals (Credit, Review) logic wrapper if needed, or keeping them simple inline */}
            <AnimatePresence>
                {selectedUserForCredits && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase">Adjust Credits</h3>
                            <input type="number" value={newCreditBalance} onChange={e => setNewCreditBalance(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-lg font-bold" />
                            <div className="flex gap-2">
                                <button onClick={() => setSelectedUserForCredits(null)} className="flex-1 py-2 text-xs font-bold text-slate-400">Cancel</button>
                                <button onClick={handleUpdateCredits} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase">Save</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Review Modal (Simplified inline for cleaner code, preserving logic) */}
            <AnimatePresence>
                {selectedReview && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-900 uppercase">Review Consultation</h3>
                                <button onClick={() => setSelectedReview(null)}><X className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <div className="p-6 overflow-y-auto space-y-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm italic text-slate-600">"{selectedReview.comments}"</div>
                                <textarea value={reviewContent} onChange={e => setReviewContent(e.target.value)} className="w-full h-40 bg-white border border-slate-200 rounded-xl p-4 text-sm focus:border-indigo-600 outline-none resize-none" placeholder="Write report..." />
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                <button onClick={handlePublish} className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest">Publish Report</button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Logs Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-900 uppercase">Log Details</h3>
                                <button onClick={() => setSelectedLog(null)}><X className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
                                <div className="space-y-2">
                                    <span className="font-bold text-indigo-600 text-xs">USER</span>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">{selectedLog.user_message}</div>
                                </div>
                                <div className="space-y-2">
                                    <span className="font-bold text-emerald-600 text-xs">AI</span>
                                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 text-sm whitespace-pre-wrap">{selectedLog.ai_response}</div>
                                </div>
                                <div className="space-y-1">
                                    <span className="font-bold text-slate-400">CONTEXT</span>
                                    <div className="bg-slate-900 p-3 rounded-lg text-amber-500 overflow-x-auto">{selectedLog.context_snapshot}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

        </main>
    );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
    return (
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-4 min-w-[160px]">
            <div className={`w-10 h-10 rounded-xl ${color} text-white flex items-center justify-center shadow-lg shadow-slate-200`}>
                {icon}
            </div>
            <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
                <p className="text-xl font-bold text-slate-900 tracking-tighter">{value}</p>
            </div>
        </div>
    );
}
