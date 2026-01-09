"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HoroscopeForm from "@/components/HoroscopeForm";
import HoroscopeResult from "@/components/HoroscopeResult";
import { AstrologyResults } from "@/lib/astrology";
import SavedHoroscopes from "@/components/SavedHoroscopes";
import { SavedHoroscope } from "@/lib/services/horoscope";
import Link from "next/link";
import {
    History, Clock, Plus, LogOut, Sparkles, Bot
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { createClient } from "@/lib/supabase";
import { consultationService, ConsultationRequest } from "@/lib/services/consultation";
import { useRouter } from "next/navigation";
import UserProfileDropdown from "@/components/UserProfileDropdown";

function DashboardContent() {
    const [results, setResults] = useState<AstrologyResults | null>(null);
    const [lastInput, setLastInput] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [lang, setLang] = useState<'en' | 'ta'>('en');
    const [user, setUser] = useState<any>(null);
    const [myConsultations, setMyConsultations] = useState<ConsultationRequest[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [fromSaved, setFromSaved] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.replace('/');
                return;
            }
            setUser(session.user);
            consultationService.getMyConsultations().then(setMyConsultations);
        });
    }, []);

    // Separated effect to run ONLY when user is set
    useEffect(() => {
        if (user) {
            const stored = sessionStorage.getItem('pending_calculation');
            if (stored) {
                const data = JSON.parse(stored);
                // Clean up immediately to prevent double-fire
                sessionStorage.removeItem('pending_calculation');
                handleCalculate(data);
            }
        }
    }, [user]);

    const handleCalculate = async (data: { dob: string; tob: string; pob: string; lat?: number; lon?: number }) => {
        setFromSaved(false);
        setLoading(true);
        try {
            let lat = data.lat;
            let lon = data.lon;

            if (lat === undefined || lon === undefined) {
                const { getCoordinates } = await import("@/lib/astrology");
                const coords = await getCoordinates(data.pob);
                lat = coords.lat;
                lon = coords.lon;
            }

            const response = await fetch("/api/astrology", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dob: data.dob,
                    tob: data.tob,
                    lat: lat,
                    lon: lon
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to calculate birth chart");
            }

            const result = await response.json();
            setLastInput({ ...data, lat, lon });
            setResults(result);
            setShowForm(false); // Hide form if it was open

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error: any) {
            console.error("Calculation Error:", error);
            alert(error.message || "An error occurred during calculation.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSaved = (h: SavedHoroscope) => {
        setFromSaved(true);
        if (h.chart_data) {
            setLoading(true);
            setTimeout(() => {
                setLastInput({ dob: h.dob, tob: h.tob, pob: h.pob, lat: h.lat, lon: h.lon, name: h.name });
                setResults(h.chart_data);
                setLoading(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 600); // Small artificial delay for UX smoothness
        } else {
            handleCalculate({
                dob: h.dob,
                tob: h.tob,
                pob: h.pob,
                lat: h.lat,
                lon: h.lon
            });
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-widest animate-pulse">Generating Chart...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Fixed Top Header */}


            <main className="min-h-screen pb-40 px-6">
                <div className="max-w-[1400px] mx-auto space-y-6">

                    {/* Header - Only show when NOT viewing results AND NOT showing form */}
                    {!results && !showForm && (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 text-center md:text-left">
                            <div className="space-y-2">
                                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Hello, {user?.user_metadata?.full_name || 'Seeker'}</h1>
                                <p className="text-slate-500 font-medium">Welcome to your personal astrological space.</p>
                            </div>
                        </div>
                    )}

                    {/* Main Content Area */}
                    {results ? (
                        <div className="relative w-full">
                            <button
                                onClick={() => {
                                    setResults(null);
                                }}
                                className="mb-6 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900/50 hover:bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest border border-white/10 transition-all hover:-translate-y-0.5"
                            >
                                <span>← Back to Home Page</span>
                            </button>
                            <HoroscopeResult
                                results={results}
                                inputData={lastInput}
                                language={lang}
                                onLanguageChange={setLang}
                                variant="dashboard"
                                disableAutoSave={fromSaved}
                                onReset={() => {
                                    setResults(null);
                                    setShowForm(true);
                                    setFromSaved(false);
                                }}
                            />
                        </div>
                    ) : showForm ? (
                        <div className="max-w-2xl mx-auto space-y-12">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900/50 hover:bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest border border-white/10 transition-all hover:-translate-y-0.5"
                                >
                                    <span>← Back to Home Page</span>
                                </button>
                            </div>
                            <div className="text-center space-y-4">
                                <h2 className="text-3xl font-bold text-slate-900">New Horoscope</h2>
                                <p className="text-slate-500">Enter birth details for accurate Vedic calculations.</p>
                            </div>
                            <HoroscopeForm onCalculate={handleCalculate} loading={loading} language={lang} initialData={lastInput} />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Quick Actions Grid - 3 Columns on Mobile */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                                {/* Create New Action */}
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl shadow-lg shadow-indigo-500/20 text-center flex flex-col items-center justify-center gap-3 transition-all group hover:-translate-y-1 aspect-square sm:aspect-auto sm:h-full"
                                >
                                    <div className="space-y-2 flex flex-col items-center">
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                            <Plus className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-sm sm:text-base font-bold leading-tight">New Chart</h3>
                                    </div>
                                    <p className="hidden sm:block text-indigo-100 text-[10px] font-medium tracking-wide uppercase">For self or family</p>
                                </button>

                                {/* Quick Access: Consultations */}
                                <Link
                                    href="/consultation"
                                    className="bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-md p-4 rounded-2xl text-center flex flex-col items-center justify-center gap-3 transition-all group hover:-translate-y-1 aspect-square sm:aspect-auto sm:h-full"
                                >
                                    <div className="space-y-2 flex flex-col items-center">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                            <Sparkles className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                                        </div>
                                        <h3 className="text-sm sm:text-base font-bold leading-tight text-slate-900">Consult</h3>
                                    </div>
                                    <p className="hidden sm:block text-slate-500 text-[10px] font-bold tracking-wide uppercase group-hover:text-indigo-600 transition-colors">Get personalized remedies</p>
                                </Link>

                                {/* Quick Access: History */}
                                <Link
                                    href="/consultation/history"
                                    className="bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-md p-4 rounded-2xl text-center flex flex-col items-center justify-center gap-3 transition-all group hover:-translate-y-1 aspect-square sm:aspect-auto sm:h-full"
                                >
                                    <div className="space-y-2 flex flex-col items-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                                            <History className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
                                        </div>
                                        <h3 className="text-sm sm:text-base font-bold leading-tight text-slate-900">History</h3>
                                    </div>
                                    <p className="hidden sm:block text-slate-500 text-[10px] font-bold tracking-wide uppercase group-hover:text-indigo-600 transition-colors">Past readings & chats</p>
                                </Link>

                                {/* AI Astrologer */}
                                <Link
                                    href="/chat"
                                    className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4 rounded-2xl shadow-lg shadow-slate-900/20 text-center flex flex-col items-center justify-center gap-3 transition-all group hover:-translate-y-1 aspect-square sm:aspect-auto sm:h-full relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
                                        <Bot className="w-8 h-8 rotate-12" />
                                    </div>
                                    <div className="space-y-2 flex flex-col items-center relative z-10">
                                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10">
                                            <Bot className="w-6 h-6 text-indigo-300 group-hover:text-white transition-colors" />
                                        </div>
                                        <h3 className="text-sm sm:text-base font-bold leading-tight text-white">Ask AI</h3>
                                    </div>
                                    <p className="hidden sm:block text-indigo-200 text-[10px] font-bold tracking-wide uppercase">Instant Answers</p>
                                </Link>
                            </div>

                            {/* Recent History / Saved */}
                            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                                <SavedHoroscopes onSelect={handleSelectSaved} language={lang} />
                            </div>
                        </div>
                    )}
                </div>
            </main >
        </>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
