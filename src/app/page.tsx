"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HoroscopeForm from "@/components/HoroscopeForm";
import HoroscopeResult from "@/components/HoroscopeResult";
import Testimonials from "@/components/Testimonials";
import { RASHI_PREDICTIONS } from "@/lib/predictions-2026";
import Link from "next/link";
import {
    Shield, Briefcase, Lock, Clock, Compass, Sparkles, ArrowRight
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import VibeCheck from "@/components/VibeCheck";
import { createClient } from "@/lib/supabase";
import { AstrologyResults } from "@/lib/astrology";
import { useRouter } from "next/navigation";
import UserProfileDropdown from "@/components/UserProfileDropdown";

function HomeContent() {
    const [results, setResults] = useState<AstrologyResults | null>(null);
    const [lastInput, setLastInput] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [lang, setLang] = useState<'en' | 'ta'>('en');
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [currentHoroscopeId, setCurrentHoroscopeId] = useState<string | null>(null);
    const [hasPending, setHasPending] = useState(false);

    useEffect(() => {
        const supabase = createClient();

        // Check session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                router.replace('/dashboard');
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user);
            if (session?.user) {
                router.replace('/dashboard');
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);


    const handleCalculate = async (data: { name: string; dob: string; tob: string; pob: string; lat?: number; lon?: number }) => {
        // GUEST FLOW: Requires Signup
        if (!user) {
            sessionStorage.setItem('pending_calculation', JSON.stringify(data));
            setHasPending(true);
            setAuthMode('signup');
            setIsAuthOpen(true);
            return;
        }

        // LOGGED IN FLOW (If they stay on landing page):
        // We can either redirect them to dashboard OR calculate here.
        // Let's redirect them to dashboard with the data to keep logic in one place?
        // OR just run it here for quick access. Let's run it here for "Instant" feel.

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

    return (
        <>
            {/* Announcement Bar */}
            <Link href="/predictions">
                <div className="bg-indigo-600 text-white py-2 px-4 text-center cursor-pointer hover:bg-indigo-700 transition-colors relative z-50">
                    <p className="text-xs md:text-sm font-medium flex items-center justify-center gap-2">
                        <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">New</span>
                        <span>Check out your 2026 Horoscope Predictions (English & Tamil)</span>
                        <ArrowRight className="w-4 h-4" />
                    </p>
                </div>
            </Link>

            {/* Fixed Top Header - Show when user is logged in */}


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

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex justify-center pt-2"
                            >
                                <Link href="/ai" className="group relative inline-flex items-center gap-3 bg-slate-900 text-white pl-5 pr-4 py-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                                            <Sparkles className="w-4 h-4 text-indigo-300 group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-bold text-indigo-300 group-hover:text-indigo-100 uppercase tracking-wider leading-none mb-0.5">New Feature</p>
                                            <p className="text-sm font-bold leading-none">Ask AI Astrologer &rarr;</p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
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
                                    <HoroscopeForm onCalculate={handleCalculate} loading={loading} language={lang} initialData={lastInput} />
                                </motion.div>
                            ) : (
                                <div key="result-container" className="relative w-full">
                                    <HoroscopeResult
                                        results={results}
                                        inputData={lastInput}
                                        language={lang}
                                        onLanguageChange={setLang}
                                        variant="public"
                                        onReset={() => {
                                            setResults(null);
                                            setResults(null);
                                            // Keep lastInput for edit flow
                                        }}
                                    />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {!results && (
                        <div className="w-full space-y-24">
                            {/* Compatibility Lab Teaser */}
                            <section className="max-w-[1400px] mx-auto px-6 pt-12">
                                <Link href="/vibecheck" className="block group">
                                    <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 to-indigo-600 rounded-[3rem] p-1 shadow-2xl shadow-indigo-500/10">
                                        <div className="bg-white rounded-[2.9rem] p-8 md:p-16 text-center space-y-6 relative overflow-hidden">
                                            {/* Decor */}
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-[80px] -z-10 group-hover:bg-pink-100 transition-colors" />
                                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -z-10 group-hover:bg-indigo-100 transition-colors" />

                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest">
                                                <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                New Tool
                                            </div>

                                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
                                                Check Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-600">Vibe Score</span>
                                            </h2>

                                            <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
                                                Decode your romantic chemistry with coordinate-based precision.
                                                See if it's a Karmic Lesson or an Electric Connection.
                                            </p>

                                            <div className="pt-4">
                                                <button className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest group-hover:scale-105 transition-transform">
                                                    Launch Protocol <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </section>

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
                                        { title: "Privacy First", desc: "Astrologers & AI never see your name. We don't sell data or train AI on your history.", icon: Lock }
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

                            {/* New: AI Spotlight Section */}
                            <section className="max-w-[1400px] mx-auto px-6">
                                <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl shadow-indigo-500/20">
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5980?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/50" />

                                    <div className="relative z-10 grid md:grid-cols-2 gap-12 p-12 md:p-24 items-center">
                                        <div className="space-y-8">
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest">
                                                <Sparkles className="w-4 h-4" />
                                                New Intelligence
                                            </div>
                                            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.1]">
                                                Decode Your Destiny with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI Precision</span>
                                            </h2>
                                            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                                                Our advanced AI Astrologer analyzes planetary transits, dashas, and nakshatra padams to provide hyper-personalized insights instantly.
                                            </p>
                                            <div className="flex flex-wrap gap-4">
                                                <Link href="/ai" className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-indigo-50 transition-colors flex items-center gap-2">
                                                    Try AI Chat <ArrowRight className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-8 py-4 bg-transparent border border-slate-700 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:border-slate-500 transition-colors">
                                                    Get Birth Chart
                                                </button>
                                            </div>
                                        </div>
                                        <div className="hidden md:block relative">
                                            {/* Abstract UI Mockup */}
                                            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                                <div className="flex items-center gap-4 mb-6 border-b border-slate-700/50 pb-4">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                                        <Sparkles className="w-5 h-5 text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <div className="h-2 w-24 bg-slate-600 rounded mb-1.5" />
                                                        <div className="h-1.5 w-16 bg-slate-700 rounded" />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="h-2 w-full bg-slate-700/50 rounded" />
                                                    <div className="h-2 w-5/6 bg-slate-700/50 rounded" />
                                                    <div className="h-2 w-4/6 bg-slate-700/50 rounded" />
                                                </div>
                                                <div className="mt-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                                    <div className="flex gap-2">
                                                        <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" />
                                                        <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce delay-75" />
                                                        <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce delay-150" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* New: 2026 Predictions Preview */}
                            <section className="max-w-[1400px] mx-auto px-6 py-12">
                                <div className="text-center space-y-4 mb-12">
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] bg-amber-50 px-3 py-1 rounded-full">Annual Forecast</span>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">2026 Horoscope Predictions</h2>
                                    <p className="text-slate-500 max-w-2xl mx-auto">General guidance based on your Moon Sign (Rashi).</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {Object.entries(RASHI_PREDICTIONS).slice(0, 4).map(([sign, data]) => (
                                        <Link key={sign} href="/predictions" className="group p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 transition-all hover:shadow-lg">
                                            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{sign}</h3>
                                            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{data.overview}</p>
                                        </Link>
                                    ))}
                                </div>
                                <div className="mt-12 text-center">
                                    <Link href="/predictions" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors">
                                        View All Signs <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </section>

                            <Testimonials />

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


                        </div>
                    )}
                </div>
                <AuthModal
                    isOpen={isAuthOpen}
                    onClose={() => setIsAuthOpen(false)}
                    initialMode={authMode}
                    customTitle={authMode === 'signup' && hasPending ? "Unlock Your Free Birth Chart" : undefined}
                    customDescription={authMode === 'signup' && hasPending ? "Continue to get your free birth chart and know more about you in just 1 click." : undefined}
                />
            </main >
        </>
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
