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
    { id: 'career', label: 'Career & Growth', icon: Briefcase, color: 'text-blue-500' },
    { id: 'love', label: 'Relationships', icon: Heart, color: 'text-rose-500' },
    { id: 'health', label: 'Health & Vitality', icon: Activity, color: 'text-emerald-500' },
    { id: 'wealth', label: 'Financial Strategy', icon: DollarSign, color: 'text-amber-500' },
    { id: 'family', label: 'Family Dynamics', icon: MessageSquare, color: 'text-purple-500' },
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
            alert("Analysis submitted to Admin for final validation.");
        } catch (error) {
            alert("Failed to sync report.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 pt-32 pb-40">
            <div className="max-w-[1400px] mx-auto px-6">
                <AnimatePresence mode="wait">
                    {!selectedTask ? (
                        <motion.div
                            key="queue"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h1 className="text-4xl font-bold text-slate-900 tracking-tighter flex items-center gap-4 uppercase">
                                        <Briefcase className="w-10 h-10 text-indigo-600" />
                                        Analytical Terminal
                                    </h1>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] pl-14">Centralized Job Card Management</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-center min-w-[140px]">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Queue Status</p>
                                        <p className="text-xl font-bold text-slate-900">{tasks.length} Jobs Active</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 text-slate-400 hover:text-rose-500 transition-colors"
                                        title="Sign Out"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="p-40 flex flex-col items-center justify-center space-y-4 bg-white border border-slate-200 border-dashed rounded-[3rem]">
                                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Establishing Satellite Link...</p>
                                </div>
                            ) : tasks.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {tasks.map((task) => (
                                        <motion.button
                                            key={task.id}
                                            onClick={() => handleOpenTask(task)}
                                            whileHover={{ scale: 1.02, y: -4 }}
                                            className="group text-left bg-white p-8 rounded-[2.5rem] border border-slate-200 hover:border-indigo-600 transition-all shadow-xl hover:shadow-indigo-500/10 flex flex-col gap-6"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className={`px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${task.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                                    task.status === 'pending_admin' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                                        'bg-amber-50 border-amber-100 text-amber-600'
                                                    }`}>
                                                    {task.status === 'completed' ? 'Published' :
                                                        task.status === 'pending_admin' ? 'Awaiting Admin' :
                                                            'Action Required'}
                                                </div>
                                                <History className="w-4 h-4 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{task.horoscopes?.name || 'Identity Unknown'}</h3>
                                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Focus: {task.categories.join(' • ')}</p>
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-4">
                                                    <Calendar className="w-3.5 h-3.5" /> {task.horoscopes?.dob}
                                                    <MapPin className="w-3.5 h-3.5 ml-2" /> {task.horoscopes?.pob}
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded-[3rem] p-40 text-center border-dashed space-y-6">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto transition-transform hover:rotate-12">
                                        <CheckCircle2 className="w-12 h-12 text-slate-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xl font-bold text-slate-900 uppercase tracking-tighter">Operational Peace</p>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">No active inquiries detected in the pipeline.</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="detail"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white border border-slate-200 rounded-[3.5rem] shadow-2xl overflow-hidden min-h-[85vh] flex flex-col"
                        >
                            {/* Full Page Detail Header */}
                            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => setSelectedTask(null)}
                                        className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Deep Analysis Suite</h2>
                                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em]">Job Protocol #{selectedTask.id.slice(0, 8)}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <DetailBadge icon={<User className="w-3.5 h-3.5" />} label="Identity" value={selectedTask.horoscopes?.name || 'N/A'} />
                                    <DetailBadge icon={<Calendar className="w-3.5 h-3.5" />} label="DOB" value={selectedTask.horoscopes?.dob || 'N/A'} />
                                    <DetailBadge icon={<Clock className="w-3.5 h-3.5" />} label="TOB" value={selectedTask.horoscopes?.tob || 'N/A'} />
                                    <DetailBadge icon={<MapPin className="w-3.5 h-3.5" />} label="POB" value={selectedTask.horoscopes?.pob || 'N/A'} />
                                </div>
                            </div>

                            <div className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-12 overflow-y-auto">
                                {/* Left Side: Astronomical Engine */}
                                <div className="lg:col-span-5 space-y-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="w-5 h-5 text-indigo-600" />
                                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em]">Spacetime Configuration</h4>
                                        </div>

                                        {calculating ? (
                                            <div className="aspect-square bg-slate-50 border border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center space-y-6 border-dashed">
                                                <div className="relative">
                                                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-indigo-600 uppercase">CALC</div>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parsing Planetary Degrees...</p>
                                            </div>
                                        ) : astrologyResults ? (
                                            <div className="space-y-8 animate-in fade-in duration-700">
                                                <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl shadow-indigo-500/10">
                                                    <SouthIndianChart
                                                        title="Birth Rasi"
                                                        planets={astrologyResults.planets}
                                                        lagnaIdx={astrologyResults.lagna.idx}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <ResultCard label="Nakshatra" value={astrologyResults.nakshatra.name} sub={`Padam ${astrologyResults.nakshatra.padam}`} />
                                                    <ResultCard label="Moon Sign" value={astrologyResults.moon_sign.name} sub="Rasi Identity" />
                                                    <ResultCard label="Lagna" value={astrologyResults.lagna.name} sub="Ascendant" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="aspect-square bg-red-50 border border-red-100 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center space-y-4">
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-sm font-bold text-red-900 uppercase tracking-widest">Calculation Failure</p>
                                                    <p className="text-[10px] font-medium text-red-400 uppercase tracking-widest leading-relaxed">Identity metadata incomplete or engine unreachable. Check server status.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Inquiry & Report */}
                                <div className="lg:col-span-7 space-y-12">
                                    {/* Focus Areas */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <History className="w-5 h-5 text-indigo-600" />
                                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em]">Inquiry Context</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {selectedTask.categories.map(catId => {
                                                const cat = CATEGORIES.find(c => c.id === catId);
                                                if (!cat) return null;
                                                const Icon = cat.icon;
                                                return (
                                                    <div key={catId} className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:border-indigo-400 group">
                                                        <Icon className={`w-4 h-4 ${cat.color} group-hover:scale-110 transition-transform`} />
                                                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">{cat.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Client Words */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em]">Seeker Testimony</h4>
                                        </div>
                                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 italic text-base text-slate-600 leading-relaxed font-medium shadow-inner relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
                                            "{selectedTask.comments}"
                                        </div>
                                    </div>

                                    {/* Report Area */}
                                    <div className="space-y-4 flex flex-col flex-1 pb-10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <AlertCircle className="w-5 h-5 text-indigo-600" />
                                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em]">Analytical Findings</h4>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{reportContent.length} Characters Transcribed</span>
                                        </div>
                                        <textarea
                                            value={reportContent}
                                            onChange={(e) => setReportContent(e.target.value)}
                                            placeholder="Transcribe surgical planetary insights here..."
                                            className="w-full min-h-[400px] bg-slate-50 border border-slate-200 rounded-[2.5rem] p-10 text-base font-medium focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all outline-none resize-none shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer controls */}
                            <div className="p-10 border-t border-slate-100 bg-white flex items-center justify-between">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Encrypted Channel • Predictive Computing Authorized</p>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedTask(null)}
                                        className="px-8 py-4 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                                    >
                                        Discard Changes
                                    </button>
                                    <button
                                        onClick={handleSubmitReport}
                                        disabled={submitting || !reportContent}
                                        className="bg-slate-900 hover:bg-indigo-600 text-white px-12 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-2xl hover:shadow-indigo-500/20 flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Ship Findings & Close Protocol
                                    </button>
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
        <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
            <div className="text-indigo-600">{icon}</div>
            <div className="flex flex-col">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</span>
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight mt-0.5">{value}</span>
            </div>
        </div>
    );
}

function ResultCard({ label, value, sub }: { label: string, value: string, sub: string }) {
    return (
        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-2 group hover:bg-indigo-50 hover:border-indigo-200 transition-all">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-400">{label}</p>
            <p className="text-xl font-black text-slate-900 uppercase tracking-tighter">{value}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-300">{sub}</p>
        </div>
    );
}
