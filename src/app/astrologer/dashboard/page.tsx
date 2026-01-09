"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, Briefcase, Clock, CheckCircle2,
    ArrowRight, Loader2, Sparkles, User, Mail, Calendar,
    MapPin, MessageSquare, AlertCircle, Heart, Activity, DollarSign, X, ArrowLeft, History, LogOut
} from "lucide-react";
import { consultationService, ConsultationRequest } from "@/lib/services/consultation";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import SouthIndianChart from "@/components/SouthIndianChart";
import { AstrologyResults } from "@/lib/astrology";

const CATEGORIES = [
    { id: 'career', label: 'Career', icon: Briefcase, color: 'text-blue-600' },
    { id: 'love', label: 'Relationships', icon: Heart, color: 'text-rose-600' },
    { id: 'health', label: 'Health', icon: Activity, color: 'text-emerald-600' },
    { id: 'wealth', label: 'Wealth', icon: DollarSign, color: 'text-amber-600' },
    { id: 'family', label: 'Family', icon: MessageSquare, color: 'text-purple-600' },
];

export default function AstrologerDashboard() {
    const router = useRouter();
    const [tasks, setTasks] = useState<ConsultationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<ConsultationRequest | null>(null);
    const [reportContent, setReportContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [astrologyResults, setAstrologyResults] = useState<AstrologyResults | null>(null);
    const [calculating, setCalculating] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await consultationService.getAssignedTasks();
                setTasks(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    useEffect(() => {
        const fetchAstrology = async () => {
            if (!selectedTask || !selectedTask.horoscopes) {
                setAstrologyResults(null);
                return;
            }

            setCalculating(true);
            try {
                const h = selectedTask.horoscopes;
                const response = await fetch("/api/astrology", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        dob: h.dob,
                        tob: h.tob,
                        lat: h.lat,
                        lon: h.lon
                    }),
                });
                const result = await response.json();
                if (result.error) throw new Error(result.error);
                setAstrologyResults(result);
            } catch (err) {
                console.error("Failed to fetch astrology:", err);
                setAstrologyResults(null);
            } finally {
                setCalculating(false);
            }
        };
        fetchAstrology();
    }, [selectedTask]);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
    };

    const handleOpenTask = (task: ConsultationRequest) => {
        setSelectedTask(task);
        setReportContent(task.report_content || "");
    };

    const handleSubmitReport = async () => {
        if (!selectedTask) return;
        setSubmitting(true);
        try {
            await consultationService.submitReport(selectedTask.id, reportContent);
            setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, status: 'pending_admin', report_content: reportContent } : t));
            setSelectedTask(null);
            alert("Report submitted for validation.");
        } catch (error) {
            alert("Failed to sync report.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 pb-20 safe-area-inset-bottom">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 safe-area-inset-top">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-none">Consultant</h1>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Dashboard</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <AnimatePresence mode="wait">
                    {!selectedTask ? (
                        <motion.div
                            key="queue"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                    Active Cases ({tasks.length})
                                </h2>
                            </div>

                            {loading ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                    <p className="text-xs font-medium text-slate-500">Loading cases...</p>
                                </div>
                            ) : tasks.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {tasks.map((task) => (
                                        <motion.button
                                            key={task.id}
                                            onClick={() => handleOpenTask(task)}
                                            whileTap={{ scale: 0.98 }}
                                            className="group text-left bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/5 transition-all flex flex-col gap-4 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-indigo-600 transition-colors" />

                                            <div className="flex items-start justify-between w-full">
                                                <div className="space-y-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                                                            task.status === 'pending_admin' ? 'bg-indigo-50 text-indigo-700' :
                                                                'bg-amber-50 text-amber-700'
                                                        }`}>
                                                        {task.status === 'completed' ? 'Published' :
                                                            task.status === 'pending_admin' ? 'Under Review' :
                                                                'Pending Action'}
                                                    </span>
                                                    <h3 className="text-base font-bold text-slate-900">{task.horoscopes?.name || 'Unknown'}</h3>
                                                </div>
                                                <History className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                            </div>

                                            <div className="space-y-3 pt-2 border-t border-slate-50 w-full">
                                                <div className="flex flex-wrap gap-2">
                                                    {task.categories.map(cat => (
                                                        <span key={cat} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                            {cat}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3" /> {task.horoscopes?.dob}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="w-3 h-3" /> {task.horoscopes?.pob}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-base font-bold text-slate-900">All caught up</p>
                                    <p className="text-sm text-slate-500">No pending inquiries assigned to you.</p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="detail"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="flex flex-col gap-6"
                        >
                            {/* Detail Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedTask(null)}
                                        className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                                    </button>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">{selectedTask.horoscopes?.name}</h2>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {selectedTask.horoscopes?.dob}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedTask.horoscopes?.tob}</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedTask.horoscopes?.pob}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {selectedTask.categories.map(c => (
                                        <span key={c} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Chart Section */}
                                <div className="lg:col-span-5 space-y-6">
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="mb-6 flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Birth Chart</h3>
                                            {calculating && <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />}
                                        </div>

                                        {astrologyResults ? (
                                            <div className="space-y-6">
                                                <div className="bg-slate-900 p-4 sm:p-6 rounded-xl">
                                                    <SouthIndianChart
                                                        title="Rasi Chart"
                                                        planets={astrologyResults.planets}
                                                        lagnaIdx={astrologyResults.lagna.idx}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Lagna</p>
                                                        <p className="text-sm font-bold text-slate-900">{astrologyResults.lagna.name}</p>
                                                    </div>
                                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Moon</p>
                                                        <p className="text-sm font-bold text-slate-900">{astrologyResults.moon_sign.name}</p>
                                                    </div>
                                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Nakshatra</p>
                                                        <p className="text-sm font-bold text-slate-900 truncate">{astrologyResults.nakshatra.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                Chart Data Unavailable
                                            </div>
                                        )}
                                    </div>

                                    {/* Inquiry Box */}
                                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 text-amber-900">
                                        <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-70">User Question</h3>
                                        <p className="text-sm font-medium italic">"{selectedTask.comments}"</p>
                                    </div>
                                </div>

                                {/* Editor Section */}
                                <div className="lg:col-span-7 flex flex-col gap-4">
                                    <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Analysis Report</h3>
                                            <span className="text-[10px] font-bold text-slate-400">{reportContent.length} chars</span>
                                        </div>
                                        <textarea
                                            value={reportContent}
                                            onChange={(e) => setReportContent(e.target.value)}
                                            placeholder="Write your detailed astrological analysis here..."
                                            className="flex-1 w-full min-h-[300px] bg-slate-50 border-0 rounded-xl p-4 text-sm sm:text-base font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedTask(null)}
                                            className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors flex-1"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmitReport}
                                            disabled={submitting || !reportContent}
                                            className="px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-indigo-600 transition-colors shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 flex-[2]"
                                        >
                                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            Submit Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}

function DetailBadge({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="text-slate-400">{icon}</div>
            <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-xs font-bold text-slate-900">{value}</p>
            </div>
        </div>
    );
}

function ResultCard({ label, value, sub }: { label: string, value: string, sub: string }) {
    // Unused in new design but kept for safety if I revert to separate components
    return null;
}
