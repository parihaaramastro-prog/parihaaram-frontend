"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Settings, ShieldCheck, Grid,
    Database, Activity, Search, Filter,
    ArrowUpRight, Loader2, UserPlus, UserCheck, CheckCircle2, Clock,
    Mail, Shield, Trash2, MoreVertical, Info, AlertTriangle, X, MessageSquare, Briefcase, LogOut, Coins
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { consultationService } from "@/lib/services/consultation";
import { profileService, User } from "@/lib/services/profile";
import { settingsService } from "@/lib/services/settings";
import { creditService } from "@/lib/services/credits";

export default function AdminDashboard() {
    const router = useRouter();
    const [consultations, setConsultations] = useState<any[]>([]);
    const [astrologers, setAstrologers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, complete: 0 });
    const [activeTab, setActiveTab] = useState<'consultations' | 'staff' | 'settings' | 'users'>('consultations');

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

    // Review State
    const [selectedReview, setSelectedReview] = useState<any | null>(null);
    const [reviewContent, setReviewContent] = useState("");
    const [publishing, setPublishing] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [conData, astroData, usersData, creditsData] = await Promise.all([
                consultationService.getAllConsultations(),
                profileService.getAstrologers(),
                profileService.getAllUsers(),
                creditService.getAllUserCredits()
            ]);
            setConsultations(conData);
            setAstrologers(astroData);
            setAllUsers(usersData);

            const creditMap: Record<string, number> = {};
            creditsData.forEach((c: any) => { creditMap[c.user_id] = c.credits; });
            setUserCredits(creditMap);

            const pending = conData.filter((c: any) => c.status === 'pending').length;
            const complete = conData.filter((c: any) => c.status === 'completed').length;
            setStats({ total: conData.length, pending, complete });
        } catch (error: any) {
            console.error("Terminal Sync Error:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            alert(`Operational Sync Failed: ${error.message || 'Check terminal logs'}`);
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
        });
    }, []);

    const toggleRazorpay = async () => {
        const newState = !razorpayEnabled;
        setRazorpayEnabled(newState);
        try {
            await settingsService.updateSettings({ razorpay_enabled: newState });
        } catch (e) {
            console.error(e);
            alert("Failed to sync setting to server.");
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
            console.error("Save Pricing Error:", e);
            alert(`Failed to save pricing: ${e.message || "Unknown error"}`);
        }
    };

    const saveModel = async () => {
        try {
            await settingsService.updateSettings({ ai_model: aiModel });
            alert("AI Model preference saved globally.");
        } catch (e: any) {
            console.error("Save Model Error:", e);
            alert(`Failed to save model: ${e.message}`);
        }
    };

    const handleUpdateCredits = async () => {
        if (!selectedUserForCredits) return;
        setUpdatingCredits(true);
        try {
            await creditService.updateUserCredits(selectedUserForCredits.id, newCreditBalance);
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

    const handleRemoveStaff = async (id: string) => {
        if (!confirm("Revoke all consultant clearances for this member?")) return;
        try {
            await profileService.updateRole(id, 'customer');
            fetchData();
        } catch (err) {
            alert("Failed to revoke clearance.");
        }
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
        <main className="min-h-screen bg-slate-50 pt-32 pb-40 px-6">
            <div className="max-w-[1600px] mx-auto space-y-10">

                {/* Header & Stats */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-indigo-600" />
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tighter uppercase">Operations Hub</h1>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] pl-11">Pariharam Global Control Surface</p>
                    </div>

                    <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setActiveTab('consultations')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'consultations' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Consultations
                        </button>
                        <button
                            onClick={() => setActiveTab('staff')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'staff' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Staff Management
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Settings
                        </button>
                        <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-slate-400 hover:text-rose-500 transition-colors flex items-center"
                            title="Sign Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                        <StatCard icon={<Database className="w-4 h-4" />} label="Inquiries" value={stats.total} color="bg-slate-900" />
                        <StatCard icon={<Clock className="w-4 h-4" />} label="Pending" value={stats.pending} color="bg-amber-600" />
                        <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Staff" value={astrologers.length} color="bg-indigo-600" />
                        <StatCard icon={<Users className="w-4 h-4" />} label="Total Users" value={allUsers.length} color="bg-emerald-600" />
                    </div>
                </div>

                {/* Operations Grid */}
                <AnimatePresence mode="wait">
                    {activeTab === 'consultations' && (
                        <motion.div
                            key="consultations"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                                        <Activity className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Global Pipeline</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative group hidden md:block">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input placeholder="Search ID, Name..." className="bg-white border border-slate-200 rounded-full py-2 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest focus:border-indigo-600 transition-all outline-none w-64 shadow-inner" />
                                    </div>
                                    <button onClick={fetchData} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                                        <Loader2 className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="p-32 flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Syncing Pipeline...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100 italic bg-slate-50/20">
                                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile</th>
                                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Context</th>
                                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assignment</th>
                                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {consultations.map((c) => (
                                                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="space-y-1">
                                                            <p className="text-[13px] font-bold text-slate-900 uppercase tracking-tight">{c.users?.full_name}</p>
                                                            <p className="text-[10px] font-medium text-slate-400">{c.users?.email}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="space-y-1">
                                                            <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">{c.categories.join(' • ')}</p>
                                                            <p className="text-[10px] font-medium text-slate-400 italic truncate max-w-[200px]">"{c.comments}"</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${c.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                                            c.status === 'pending_admin' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                                                c.status === 'reviewing' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                                                    'bg-amber-50 border-amber-100 text-amber-600'
                                                            }`}>
                                                            {c.status === 'completed' ? 'Published' :
                                                                c.status === 'pending_admin' ? 'Review Required' :
                                                                    c.status === 'reviewing' ? 'In Progress' :
                                                                        'Pending'}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <select
                                                            value={c.assigned_astrologer_id || ""}
                                                            onChange={(e) => handleAssign(c.id, e.target.value)}
                                                            disabled={c.status === 'completed' || c.status === 'pending_admin'}
                                                            className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-[11px] font-bold uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all shadow-sm disabled:opacity-50"
                                                        >
                                                            <option value="">Unassigned</option>
                                                            {astrologers.map(a => (
                                                                <option key={a.id} value={a.id}>{a.full_name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        {c.status === 'pending_admin' ? (
                                                            <button
                                                                onClick={() => handleOpenReview(c)}
                                                                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg"
                                                            >
                                                                Review & Publish
                                                            </button>
                                                        ) : (
                                                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all">
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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
                                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                                                <Users className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Active Consultants</h2>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {astrologers.length > 0 ? astrologers.map(a => (
                                            <div key={a.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold uppercase">
                                                        {a.full_name?.[0]}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{a.full_name}</p>
                                                        <p className="text-[10px] font-medium text-slate-400">{a.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Astrologer</span>
                                                    <button
                                                        onClick={() => handleRemoveStaff(a.id)}
                                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="p-20 text-center space-y-4">
                                                <AlertTriangle className="w-8 h-8 text-slate-200 mx-auto" />
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Active Consultants</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8 space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tighter">Provision New Consultant</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Create Account & Set Password</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-4">
                                            <ShieldCheck className="w-4 h-4 text-indigo-500 mt-0.5" />
                                            <p className="text-[10px] text-indigo-500 font-medium leading-relaxed">
                                                Use this to create an account for a new astrologer. Once created, you can give them the password to log in directly to the Job Dashboard.
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={newStaffName}
                                                    onChange={(e) => setNewStaffName(e.target.value)}
                                                    placeholder="Dr. Arjun Sharma"
                                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium focus:border-indigo-600 transition-all outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={newStaffEmail}
                                                    onChange={(e) => setNewStaffEmail(e.target.value)}
                                                    placeholder="arjun@pariharam.com"
                                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium focus:border-indigo-600 transition-all outline-none"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Security Code (Password)</label>
                                                <input
                                                    type="text"
                                                    value={newStaffPassword}
                                                    onChange={(e) => setNewStaffPassword(e.target.value)}
                                                    placeholder="Set initial password"
                                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium focus:border-indigo-600 transition-all outline-none"
                                                />
                                            </div>
                                        </div>

                                        {addError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-50 p-2 rounded-lg border border-red-100">{addError}</p>}
                                        {addSuccess && <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 p-2 rounded-lg border border-emerald-100">{addSuccess}</p>}

                                        <button
                                            onClick={handleCreateConsultant}
                                            disabled={addingStaff || !newStaffEmail || !newStaffPassword}
                                            className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                        >
                                            {addingStaff ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                            Authorize Consultant
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden max-w-2xl">
                                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                                            <Settings className="w-5 h-5 text-indigo-900" />
                                        </div>
                                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">System Configuration</h2>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-bold text-indigo-900">Razorpay Live Payments</h3>
                                            <p className="text-xs font-medium text-indigo-600/80 max-w-md">
                                                Enable to process real transactions via Razorpay. Disable to use Payment Simulation Mode for testing (free credits).
                                            </p>
                                            <div className="pt-2">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${razorpayEnabled ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    Current Mode: {razorpayEnabled ? 'Live & Charging' : 'Simulation & Free'}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={toggleRazorpay}
                                            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${razorpayEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                        >
                                            <span className="sr-only">Use setting</span>
                                            <span
                                                aria-hidden="true"
                                                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${razorpayEnabled ? 'translate-x-6' : 'translate-x-0'}`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8 border-t border-slate-100">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Pricing Settings */}
                                        <div className="flex-1 p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-6">
                                            <div className="space-y-1">
                                                <h3 className="text-sm font-bold text-slate-900">Standard Pack Pricing</h3>
                                                <p className="text-xs font-medium text-slate-500">Configure the cost and credit value for the standard recharge pack.</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Price (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={packPrice}
                                                        onChange={(e) => setPackPrice(Number(e.target.value))}
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold focus:border-indigo-600 transition-all outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Credits</label>
                                                    <input
                                                        type="number"
                                                        value={packCredits}
                                                        onChange={(e) => setPackCredits(Number(e.target.value))}
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold focus:border-indigo-600 transition-all outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={savePricing}
                                                className="bg-slate-900 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-indigo-500/10 active:scale-95"
                                            >
                                                Update Pricing
                                            </button>
                                        </div>

                                        {/* AI Model Settings */}
                                        <div className="flex-1 p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-6">
                                            <div className="space-y-1">
                                                <h3 className="text-sm font-bold text-slate-900">AI Model Engine</h3>
                                                <p className="text-xs font-medium text-slate-500">Select which LLM powers the astrological analysis.</p>
                                            </div>

                                            <div className="space-y-3">
                                                <div
                                                    onClick={() => setAiModel('gpt-4o')}
                                                    className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${aiModel === 'gpt-4o' ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                                                >
                                                    <span className={`text-xs font-bold uppercase tracking-widest ${aiModel === 'gpt-4o' ? 'text-indigo-700' : 'text-slate-500'}`}>GPT-4o (OpenAI)</span>
                                                    {aiModel === 'gpt-4o' && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                                                </div>

                                                <div
                                                    onClick={() => setAiModel('gemini-1.5-pro')}
                                                    className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${aiModel === 'gemini-1.5-pro' ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                                                >
                                                    <span className={`text-xs font-bold uppercase tracking-widest ${aiModel === 'gemini-1.5-pro' ? 'text-indigo-700' : 'text-slate-500'}`}>Gemini 1.5 Pro</span>
                                                    {aiModel === 'gemini-1.5-pro' && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                                                </div>
                                            </div>

                                            <button
                                                onClick={saveModel}
                                                className="mt-auto bg-slate-900 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-indigo-500/10 active:scale-95"
                                            >
                                                Save Model Preference
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                    }

                    {
                        activeTab === 'users' && (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden"
                            >
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                                            <Users className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">User Management</h2>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative group hidden md:block">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                            <input
                                                value={usersTabSearch}
                                                onChange={(e) => setUsersTabSearch(e.target.value)}
                                                placeholder="Search Name, Email, ID..."
                                                className="bg-white border border-slate-200 rounded-full py-2 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest focus:border-indigo-600 transition-all outline-none w-64 shadow-inner"
                                            />
                                        </div>
                                        <button onClick={fetchData} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                                            <Loader2 className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100 italic bg-slate-50/20">
                                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Details</th>
                                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Balance</th>
                                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {allUsers
                                                .filter(u =>
                                                    !usersTabSearch ||
                                                    (u.full_name?.toLowerCase().includes(usersTabSearch.toLowerCase()) ||
                                                        u.email.toLowerCase().includes(usersTabSearch.toLowerCase()) ||
                                                        u.id.includes(usersTabSearch))
                                                )
                                                .map((u) => (
                                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-8 py-6">
                                                            <div className="space-y-1">
                                                                <p className="text-[13px] font-bold text-slate-900 uppercase tracking-tight">{u.full_name || 'Guest User'}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-[10px] font-medium text-slate-400 flex items-center gap-2">
                                                                        <Mail className="w-3 h-3" /> {u.email}
                                                                    </p>
                                                                    <button
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(u.id);
                                                                            alert("User ID copied");
                                                                        }}
                                                                        className="text-[9px] font-mono text-slate-300 hover:text-indigo-500 cursor-pointer"
                                                                    >
                                                                        ID: {u.id.slice(0, 8)}...
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${u.role === 'admin' ? 'bg-purple-50 border-purple-100 text-purple-600' :
                                                                u.role === 'astrologer' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                                                    'bg-slate-50 border-slate-100 text-slate-500'
                                                                }`}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-2">
                                                                <Coins className="w-4 h-4 text-amber-500" />
                                                                <span className="text-sm font-bold text-slate-900">{userCredits[u.id] || 0}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <div className="flex items-center justify-end gap-3">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedUserForCredits(u);
                                                                        setNewCreditBalance(userCredits[u.id] || 0);
                                                                    }}
                                                                    className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                                                                    title="Manage Credits"
                                                                >
                                                                    <Coins className="w-4 h-4" />
                                                                </button>

                                                                <div className="w-px h-4 bg-slate-200" />

                                                                <button
                                                                    onClick={async () => {
                                                                        if (!confirm(`Generate a secure login link for ${u.email}?`)) return;
                                                                        try {
                                                                            const res = await fetch('/api/admin/users', {
                                                                                method: 'POST',
                                                                                headers: { 'Content-Type': 'application/json' },
                                                                                body: JSON.stringify({ action: 'magic_link', email: u.email })
                                                                            });
                                                                            const data = await res.json();
                                                                            if (data.link) {
                                                                                window.open(data.link, '_blank');
                                                                                alert("User accessed in new tab via Magic Link.");
                                                                            } else {
                                                                                throw new Error(data.error);
                                                                            }
                                                                        } catch (e: any) {
                                                                            alert("Access failed: " + e.message);
                                                                        }
                                                                    }}
                                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                                    title="Access Account (Magic Link)"
                                                                >
                                                                    <LogOut className="w-4 h-4 rotate-180" />
                                                                </button>

                                                                <button
                                                                    onClick={async () => {
                                                                        if (!confirm(`Are you sure you want to BLOCK ${u.email}? They will not be able to login.`)) return;
                                                                        try {
                                                                            await fetch('/api/admin/users', {
                                                                                method: 'POST',
                                                                                headers: { 'Content-Type': 'application/json' },
                                                                                body: JSON.stringify({ action: 'block', userId: u.id })
                                                                            });
                                                                            alert("User blocked.");
                                                                        } catch (e) {
                                                                            alert("Failed to block.");
                                                                        }
                                                                    }}
                                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                    title="Block Account"
                                                                >
                                                                    <Shield className="w-4 h-4" />
                                                                </button>

                                                                <button
                                                                    onClick={async () => {
                                                                        const confirmEmail = prompt(`Type "${u.email}" to confirm PERMANENT DELETION:`);
                                                                        if (confirmEmail !== u.email) return;

                                                                        try {
                                                                            await fetch('/api/admin/users', {
                                                                                method: 'DELETE',
                                                                                headers: { 'Content-Type': 'application/json' },
                                                                                body: JSON.stringify({ userId: u.id })
                                                                            });
                                                                            alert("User permanently deleted.");
                                                                            fetchData();
                                                                        } catch (e: any) {
                                                                            alert("Deletion failed: " + e.message);
                                                                        }
                                                                    }}
                                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                    title="Delete Permanently"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )
                    }
                </AnimatePresence >

                {/* Credit Management Modal */}
                <AnimatePresence>
                    {
                        selectedUserForCredits && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
                                >
                                    <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tighter">Adjust Wallet</h2>
                                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{selectedUserForCredits.full_name}</p>
                                        </div>
                                        <button onClick={() => setSelectedUserForCredits(null)} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                                            <X className="w-5 h-5 text-slate-400" />
                                        </button>
                                    </div>

                                    <div className="p-8 space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Credits Balance</label>
                                            <div className="relative">
                                                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                                                <input
                                                    type="number"
                                                    value={newCreditBalance}
                                                    onChange={(e) => setNewCreditBalance(Number(e.target.value))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-xl font-bold text-slate-900 focus:border-indigo-600 transition-all outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setSelectedUserForCredits(null)}
                                                className="flex-1 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleUpdateCredits}
                                                disabled={updatingCredits}
                                                className="flex-[2] bg-slate-900 hover:bg-indigo-600 text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {updatingCredits ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )
                    }
                </AnimatePresence >

                {/* Review Modal */}
                <AnimatePresence>
                    {
                        selectedReview && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                                >
                                    <div className="p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tighter">Review & Polish Report</h2>
                                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Client: {selectedReview.users?.full_name}</p>
                                        </div>
                                        <button onClick={() => setSelectedReview(null)} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                                            <X className="w-5 h-5 text-slate-400" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <MessageSquare className="w-3.5 h-3.5" /> Seeker's Inquiry
                                                </p>
                                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm italic text-slate-600 font-medium">
                                                    "{selectedReview.comments}"
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Briefcase className="w-3.5 h-3.5" /> Focus Areas
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedReview.categories.map((cat: string) => (
                                                        <span key={cat} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cat}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                    <Activity className="w-3.5 h-3.5 text-indigo-600" /> Consultant's Analysis (Refine below)
                                                </p>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{reviewContent.length} chars</span>
                                            </div>
                                            <textarea
                                                value={reviewContent}
                                                onChange={(e) => setReviewContent(e.target.value)}
                                                className="w-full min-h-[300px] bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-base font-medium focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all outline-none resize-none shadow-inner"
                                                placeholder="Polish the astrologer's report here..."
                                            />
                                        </div>
                                    </div>

                                    <div className="p-8 border-t border-slate-100 bg-white flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Final Validation Protocol</p>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setSelectedReview(null)}
                                                className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handlePublish}
                                                disabled={publishing || !reviewContent}
                                                className="bg-slate-900 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                                Authorize & Publish Report
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )
                    }
                </AnimatePresence >
            </div >
        </main >
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
