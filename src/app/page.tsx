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
    Shield, Briefcase, Lock, History, LayoutDashboard,
    Plus, Clock, Compass, Sparkles, User, LogOut
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { createClient } from "@/lib/supabase";
import { consultationService, ConsultationRequest } from "@/lib/services/consultation";
import { useSearchParams, useRouter } from "next/navigation";

function HomeContent() {
    const [results, setResults] = useState<AstrologyResults | null>(null);
    const [lastInput, setLastInput] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [lang, setLang] = useState<'en' | 'ta'>('en');
    const [role, setRole] = useState<string | null>(null);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [pendingData, setPendingData] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [myConsultations, setMyConsultations] = useState<ConsultationRequest[]>([]);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const { profileService } = require("@/lib/services/profile");
                profileService.getProfile().then((p: any) => setRole(p?.role || 'customer'));
                consultationService.getMyConsultations().then(setMyConsultations);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const { profileService } = require("@/lib/services/profile");
                profileService.getProfile().then((p: any) => setRole(p?.role || 'customer'));
                consultationService.getMyConsultations().then(setMyConsultations);
            } else {
                setRole(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Effect to handle navigation reset
    // Navigation reset effect removed to prevent loop
    // URL param is used directly in rendering logic
    useEffect(() => {
        // Just clear results if dashboard param is present, but DON'T redirect
        if (searchParams.get('dashboard') === 'true') {
            setResults(null);
            setShowForm(false);
            // Don't auto-redirect here, it causes the loop/flash
        }
    }, [searchParams]);

    // Effect to handle pending calculation after login
    useEffect(() => {
        const stored = sessionStorage.getItem('pending_calculation');
        if (user && stored) {
            const data = JSON.parse(stored);
            handleCalculate(data);
            sessionStorage.removeItem('pending_calculation');
        }
    }, [user]);

    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

    const handleCalculate = async (data: { dob: string; tob: string; pob: string; lat?: number; lon?: number }) => {
        if (!user) {
            sessionStorage.setItem('pending_calculation', JSON.stringify(data));
            setAuthMode('signup'); // Force signup mode
            setIsAuthOpen(true);
            return;
        }

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

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error: any) {
            console.error("Calculation Error:", error);
            alert(error.message || "An error occurred during calculation.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSaved = (h: SavedHoroscope) => {
        handleCalculate({
            dob: h.dob,
            tob: h.tob,
            pob: h.pob,
            lat: h.lat,
            lon: h.lon
        });
    };

    if (role === 'admin' || role === 'astrologer') {
        return (
            <main className="min-h-screen pt-40 px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-indigo-600 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                            <Shield className="w-4 h-4" />
                            Authorized Access
                        </div>
                        <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
                            Welcome Back, <br />
                            <span className="text-indigo-600">{role === 'admin' ? 'Admin' : 'Astrologer'}</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">
                            You are logged in with {role} privileges. Use the navigation above to access your dashboard.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12">
                        <Link
                            href={role === 'admin' ? "/admin/dashboard" : "/astrologer/dashboard"}
                            className="bg-slate-900 p-10 rounded-[2.5rem] text-white space-y-4 hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-500/10 group active:scale-[0.98]"
                        >
                            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                                {role === 'admin' ? <Shield className="w-8 h-8" /> : <Briefcase className="w-8 h-8" />}
                            </div>
                            <div className="text-left space-y-2">
                                <h3 className="text-xl font-bold uppercase tracking-tight">Access {role === 'admin' ? 'Admin Panel' : 'Dashboard'}</h3>
                                <p className="text-[11px] font-medium text-white/60 uppercase tracking-widest leading-relaxed">
                                    {role === 'admin' ? 'Manage global consultations and staff.' : 'Review assigned inquiries and submit reports.'}
                                </p>
                            </div>
                        </Link>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 space-y-4 text-left">
                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 italic">
                                <Lock className="w-8 h-8 text-slate-300" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Security Protocol</h3>
                                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">
                                    Your session is encrypted. Always remember to log out when finished with sensitive analytical data.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    const [showForm, setShowForm] = useState(false);

    if (role === 'customer' && !results) {
        if (showForm) {
            return (
                <main className="min-h-screen pt-32 pb-40 px-6">
                    <div className="max-w-[1400px] mx-auto space-y-8">
                        {/* Header with Back */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setShowForm(false)}
                                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-bold uppercase tracking-widest"
                            >
                                ← Back to Dashboard
                            </button>
                        </div>

                        <div className="max-w-2xl mx-auto space-y-12">
                            <div className="text-center space-y-4">
                                <h2 className="text-3xl font-bold text-slate-900">New Horoscope</h2>
                                <p className="text-slate-500">Enter birth details for accurate Vedic calculations.</p>
                            </div>
                            <HoroscopeForm onCalculate={handleCalculate} loading={loading} language={lang} />
                        </div>
                    </div>
                </main>
            );
        }

        return (
            <main className="min-h-screen pt-32 pb-40 px-6">
                <div className="max-w-[1400px] mx-auto space-y-12">
                    {/* Customer Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 text-center md:text-left">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Hello, {user?.user_metadata?.full_name || 'Seeker'}</h1>
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <p className="text-slate-500 font-medium">Welcome to your personal astrological space.</p>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Session Active
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                const supabase = createClient();
                                await supabase.auth.signOut();
                                window.location.href = "/";
                            }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Action - Create New */}
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white p-8 rounded-[2rem] shadow-xl shadow-indigo-500/20 text-left space-y-6 transition-all group hover:-translate-y-1"
                        >
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                <Plus className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Create New Chart</h3>
                                <p className="text-indigo-100 text-sm mt-1">Check horoscope for yourself or family.</p>
                            </div>
                        </button>

                        {/* Saved Charts Preview */}
                        <div className="bg-white border border-slate-200 p-8 rounded-[2rem] space-y-6 md:col-span-2 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900">Saved Profiles</h3>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quick Access</div>
                            </div>
                            <SavedHoroscopes onSelect={handleSelectSaved} language={lang} />
                        </div>
                    </div>

                    {/* Recent History */}
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                            <div className="flex items-center gap-3">
                                <History className="w-6 h-6 text-indigo-600" />
                                <h2 className="text-xl font-bold text-slate-900">Your Consultations</h2>
                            </div>
                            <Link href="/consultation/history" className="px-5 py-2 rounded-full bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors">View All History</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myConsultations.length > 0 ? myConsultations.slice(0, 3).map(con => (
                                <div key={con.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group">
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-slate-900">{con.horoscopes?.name}</h4>
                                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{con.categories.join(', ')}</p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${con.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {con.status === 'completed' ? 'Ready' : 'Pending'}
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200/50 flex items-center gap-2 text-xs font-medium text-slate-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{new Date(con.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-12 text-center space-y-3">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                        <History className="w-6 h-6" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No past consultations found.</p>
                                    <Link href="/consultation" className="text-indigo-600 font-bold hover:underline">Start a new consultation</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
            </main>
        );
    }

    return (
        <main className={`relative min-h-screen flex flex-col items-center ${results ? 'pt-32' : 'pt-16'} pb-40 px-4 overflow-x-hidden transition-all duration-700`}>
            <div className={`w-full ${results ? 'max-w-[1600px]' : 'max-w-4xl'} flex flex-col items-center text-center transition-all duration-1000 ease-out font-sans`}>

                {!results && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 space-y-6"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest"
                        >
                            <Sparkles className="w-4 h-4" />
                            {lang === 'ta' ? 'துல்லியமான கணிப்பு' : 'Accurate Vedic Astrology'}
                        </motion.div>

                        <h1 className={`text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] ${lang === 'ta' ? 'font-tamil' : ''}`}>
                            {lang === 'ta' ? 'உங்கள் ஜாதகம்' : 'Discover Your'} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                {lang === 'ta' ? 'இங்கே கணிக்கவும்' : 'Destiny'}
                            </span>
                        </h1>
                        <p className="text-slate-600 text-xl font-medium max-w-xl mx-auto leading-relaxed">
                            {lang === 'ta'
                                ? 'பரிகாரம்: இந்தியாவின் முதல் துல்லியமான ஜோதிட தளம்.'
                                : 'Pariharam provides accurate birth charts and personalized insights based on authentic Vedic principles.'}
                        </p>
                    </motion.div>
                )}

                <div className="w-full">
                    <AnimatePresence mode="wait">
                        {!results ? (
                            <motion.div
                                key="form-container"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                className="space-y-12"
                            >
                                <HoroscopeForm onCalculate={handleCalculate} loading={loading} language={lang} />
                                {user && !loading && <SavedHoroscopes onSelect={handleSelectSaved} language={lang} />}
                            </motion.div>
                        ) : (
                            <div key="result-container" className="relative w-full">
                                <HoroscopeResult
                                    results={results}
                                    inputData={lastInput}
                                    language={lang}
                                    onLanguageChange={setLang}
                                    onReset={() => {
                                        setResults(null);
                                        setLastInput(null);
                                    }}
                                />
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {!results && !user && (
                    <div className="w-full space-y-24">
                        {/* Features Section */}
                        <section id="features" className="max-w-[1400px] mx-auto px-6 pt-24">
                            <div className="text-center space-y-4 mb-16">
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1 rounded-full">Why Choose Pariharam</span>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Ancient Wisdom,<br />Modern Precision</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { title: "Vedic Precision", desc: "Calculations based on authentic Drig Ganitha and Vakya Panchangam methods.", icon: Compass },
                                    { title: "Instant Analysis", desc: "Get your detailed birth chart and planetary positions in seconds.", icon: Clock },
                                    { title: "Secure & Private", desc: "Your birth data is encrypted and stored securely. We prioritize your privacy.", icon: Lock }
                                ].map((feature, i) => (
                                    <div key={i} className="p-10 bg-white border border-slate-200 rounded-[2.5rem] hover:border-indigo-600 transition-all group space-y-4 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <feature.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                                        <p className="text-sm font-medium text-slate-500 leading-relaxed">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Trust Section */}
                        <section id="trust" className="max-w-[1400px] mx-auto px-6">
                            <div className="bg-slate-900 text-white rounded-[3rem] p-12 md:p-24 text-center space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-slate-900/0 to-transparent" />
                                <div className="relative z-10 space-y-6">
                                    <Shield className="w-12 h-12 mx-auto text-indigo-400" />
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tight">Trusted by Analytic Professionals</h2>
                                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                                        Our algorithms are verified by expert astrologers to ensure the highest degree of accuracy in every calculation.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <footer className="text-center space-y-12 pb-12 w-full max-w-2xl mx-auto">
                            <div className="w-12 h-[1px] bg-slate-300 mx-auto" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                <Link href="/astrologer/login" className="group p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 transition-all text-left space-y-3 shadow-sm hover:shadow-md">
                                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all inline-block">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Astrologer Portal</h4>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">Authorized access for astronomical consultants.</p>
                                    </div>
                                </Link>
                                <Link href="/admin/login" className="group p-6 bg-white border border-slate-200 rounded-2xl hover:border-slate-900 transition-all text-left space-y-3 shadow-sm hover:shadow-md">
                                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all inline-block">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Admin Center</h4>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">Restricted access for platform controllers.</p>
                                    </div>
                                </Link>
                            </div>

                            <div className="space-y-4 opacity-50 pt-8">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    {lang === 'ta' ? 'நம்பிக்கை • துல்லியம் • வழிகாட்டுதல்' : 'Trust • Accuracy • Guidance'}
                                </p>
                            </div>
                        </footer>
                    </div>
                )}
            </div>
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialMode={authMode} />
        </main>
    );
}

export default function Home() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Loading...</p>
                </div>
            </div>
        }>
            <HomeContent />
        </Suspense>
    );
}
