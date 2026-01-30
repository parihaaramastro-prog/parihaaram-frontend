"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, MapPin, Loader2, Sparkles, CheckCircle2, Clock3, FileText, ChevronRight } from "lucide-react";
import { consultationService } from "@/lib/services/consultation";
import { settingsService } from "@/lib/services/settings";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ConsultationHistoryPage() {
    const router = useRouter();
    const [consultations, setConsultations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEnabled, setIsEnabled] = useState(true);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const settings = await settingsService.getSettings();
            if (settings.consultation_enabled === false) {
                setIsEnabled(false);
                setChecking(false);
                return;
            }
            setChecking(false);

            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/');
                return;
            }
            try {
                const data = await consultationService.getMyConsultations();
                setConsultations(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, [router]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'reviewing': return <Clock3 className="w-4 h-4 text-amber-500" />;
            default: return <Clock3 className="w-4 h-4 text-slate-400" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed': return 'REPORT COMPLETE';
            case 'reviewing': return 'UNDER ANALYSIS';
            default: return 'QUEUED';
        }
    };

    if (!checking && !isEnabled) {
        return (
            <main className="min-h-screen pb-20 px-6 flex flex-col items-center justify-center text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md space-y-6"
                >
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <History className="w-8 h-8 text-slate-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">History Unavailable</h1>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Consultation services are currently paused. Your history will be available when services resume.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                    >
                        Back to Dashboard
                    </button>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pb-40 px-6">
            <div className="max-w-4xl mx-auto space-y-16">
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-indigo-600 text-[10px] font-bold uppercase tracking-widest"
                    >
                        <History className="w-4 h-4" />
                        Consultation Archive
                    </motion.div>
                    <h1 className="text-5xl font-bold text-slate-900 tracking-tight leading-none uppercase">
                        My <span className="text-indigo-600">History</span>
                    </h1>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 space-y-4">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">Syncing report history...</p>
                    </div>
                ) : consultations.length > 0 ? (
                    <div className="space-y-6">
                        {consultations.map((c, i) => (
                            <motion.div
                                key={c.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-md transition-all shadow-sm"
                            >
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 ${c.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                            {getStatusIcon(c.status)}
                                            {getStatusText(c.status)}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            {new Date(c.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                                            Analytical Inquiry: {c.categories.join(' & ')}
                                        </h3>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-indigo-400" /> {c.horoscopes?.name}</span>
                                            <span className="flex items-center gap-2"><MapPin className="w-3 h-3 text-indigo-400" /> {c.horoscopes?.pob}</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                                            "{c.comments}"
                                        </p>
                                    </div>

                                    {c.status === 'completed' && c.report_content && (
                                        <div className="space-y-6 mt-8 pt-8 border-t border-slate-100">
                                            <div className="flex items-center gap-3 text-slate-900">
                                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <h4 className="text-sm font-bold uppercase tracking-widest">Final Analytical Report</h4>
                                            </div>
                                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-inner">
                                                <p className="text-base text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                                                    {c.report_content}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-32 text-center space-y-6 shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                            <History className="w-8 h-8 text-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-lg font-bold text-slate-900 uppercase tracking-tight">Archive Empty</p>
                            <p className="text-slate-400 text-sm font-medium">You haven't requested any expert consultations yet.</p>
                        </div>
                        <button
                            onClick={() => router.push('/consultation')}
                            className="bg-slate-900 text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mx-auto"
                        >
                            Request Analysis <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
