"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Briefcase, Heart, Activity, DollarSign, MessageSquare, Loader2, ChevronRight, CheckCircle2, History } from "lucide-react";
import { horoscopeService, SavedHoroscope } from "@/lib/services/horoscope";
import { consultationService } from "@/lib/services/consultation";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const CATEGORIES = [
    { id: 'career', label: 'Career & Growth', icon: Briefcase, color: 'text-blue-500' },
    { id: 'love', label: 'Relationships', icon: Heart, color: 'text-rose-500' },
    { id: 'health', label: 'Health & Vitality', icon: Activity, color: 'text-emerald-500' },
    { id: 'wealth', label: 'Financial Strategy', icon: DollarSign, color: 'text-amber-500' },
    { id: 'family', label: 'Family Dynamics', icon: MessageSquare, color: 'text-purple-500' },
];

export default function ConsultationPage() {
    const router = useRouter();
    const [horoscopes, setHoroscopes] = useState<SavedHoroscope[]>([]);
    const [selectedHoroscope, setSelectedHoroscope] = useState<string | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [comments, setComments] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/');
                return;
            }
            const saved = await horoscopeService.getSavedHoroscopes();
            setHoroscopes(saved);
        };
        checkUser();
    }, [router]);

    const toggleCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCategories.length === 0) {
            alert("Please select at least one area of focus.");
            return;
        }
        if (!selectedHoroscope) {
            alert("Please select a horoscope for this consultation.");
            return;
        }

        setLoading(true);
        try {
            await consultationService.submitRequest({
                horoscope_id: selectedHoroscope,
                categories: selectedCategories,
                comments: comments
            });
            setSubmitted(true);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <main className="min-h-[80vh] py-20 px-6 flex flex-col items-center justify-center text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md bg-white border border-slate-200 rounded-2xl p-12 space-y-8 shadow-xl"
                >
                    <CheckCircle2 className="w-16 h-16 text-indigo-600 mx-auto" />
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Request Logged</h2>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Your inquiry has been transmitted to our expert analysis team.
                            We will conduct a detailed study of your planetary configurations.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/consultation/history')}
                        className="w-full bg-slate-900 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                        Track Status
                    </button>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pt-0 pb-20 px-6">
            <div className="max-w-5xl mx-auto space-y-12">
                <div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest border border-white/10 shadow-xl hover:bg-slate-800 transition-all hover:-translate-y-0.5"
                    >
                        <span>← Back to Home Page</span>
                    </button>
                </div>

                {/* Header */}
                <div className="text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-none uppercase">
                        Expert <span className="text-indigo-600">Guidance</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium max-w-xl mx-auto">
                        Connect with seasoned astrologers for custom reports tailored to your specific life questions.
                    </p>


                </div>

                {/* Form Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12 space-y-12 shadow-sm">
                            {/* Step 1: Select Horoscope */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">1</div>
                                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Select Profile</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {horoscopes.map(h => (
                                        <div
                                            key={h.id}
                                            onClick={() => setSelectedHoroscope(h.id)}
                                            className={`p-4 rounded-xl border-1.5 cursor-pointer transition-all duration-200 flex items-center justify-between ${selectedHoroscope === h.id ? 'bg-indigo-900 border-indigo-900 text-white shadow-lg' : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50 text-slate-900'}`}
                                        >
                                            <div>
                                                <p className="font-bold text-xs tracking-tight">{h.name}</p>
                                                <p className={`text-[9px] font-medium opacity-60 mt-0.5`}>{h.dob} • {h.pob}</p>
                                            </div>
                                            {selectedHoroscope === h.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                                        </div>
                                    ))}
                                    {horoscopes.length === 0 && (
                                        <div className="col-span-2 p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                                            <p className="text-slate-400 text-xs font-medium">No saved profiles found. Please create a profile first.</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Step 2: Categories */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">2</div>
                                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Focus Areas</h3>
                                </div>

                                <div className="flex flex-wrap gap-2.5">
                                    {CATEGORIES.map(cat => {
                                        const Icon = cat.icon;
                                        const isSelected = selectedCategories.includes(cat.id);
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => toggleCategory(cat.id)}
                                                className={`flex items-center gap-2.5 px-4 py-2 rounded-full border-1.5 transition-all duration-200 ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 hover:bg-white text-slate-600'}`}
                                            >
                                                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : cat.color}`} />
                                                <span className="text-[11px] font-bold uppercase tracking-widest">{cat.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Step 3: Thoughts & Situation */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">3</div>
                                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Details & Context</h3>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Your Questions</label>
                                    <textarea
                                        rows={6}
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        placeholder="Briefly describe your situation and specific questions for the analysis..."
                                        className="divine-input p-6 resize-none !text-sm"
                                        required
                                    />
                                </div>
                            </section>

                            <button
                                type="submit"
                                disabled={loading || horoscopes.length === 0}
                                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        <BookOpen className="w-4 h-4 text-indigo-400" />
                                        <span>Submit Request</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Side Info */}
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4 flex items-center gap-3">
                                <History className="w-4 h-4 text-indigo-600" /> Status Tracking
                            </h4>
                            <div className="space-y-4">
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">View the progress of your active requests and access past analytical reports.</p>
                                <button
                                    onClick={() => router.push('/consultation/history')}
                                    className="w-full py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 hover:bg-slate-50 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    Report History <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-indigo-900 rounded-2xl p-6 text-white space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-widest">Our Methodology</h4>
                            <ul className="space-y-3">
                                <li className="flex gap-3 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />
                                    <p className="text-[11px] font-medium text-indigo-100 leading-normal">Deep algorithmic analysis of planetary configurations.</p>
                                </li>
                                <li className="flex gap-3 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />
                                    <p className="text-[11px] font-medium text-indigo-100 leading-normal">Peer-reviewed report generation for maximum accuracy.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
