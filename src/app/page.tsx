"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HoroscopeForm from "@/components/HoroscopeForm";
import HoroscopeResult from "@/components/HoroscopeResult";
import Testimonials from "@/components/Testimonials";
import { AstrologyResults } from "@/lib/astrology";
import Link from "next/link";
import {
    Shield, Briefcase, Lock, Clock, Compass, Sparkles
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { createClient } from "@/lib/supabase";
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
            setUser(session?.user);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user);
            if (session?.user) {
                // Check if we have pending calculation
                const pending = sessionStorage.getItem('pending_calculation');
                if (pending) {
                    // Redirect to dashboard to process it
                    router.push('/dashboard');
                }
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

                            <footer className="text-center space-y-12 pb-12 w-full max-w-2xl mx-auto">
                                <div className="w-12 h-[1px] bg-slate-300 mx-auto" />

                                <div className="pt-8 flex justify-center">
                                    <Link href="/astrologer/login" className="text-[10px] uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors font-bold">
                                        Astrologer Login
                                    </Link>
                                </div>

                                <div className="space-y-4 opacity-50 pt-8">
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                                        {lang === 'ta' ? 'நம்பிக்கை • துல்லியம் • வழிகாட்டுதல்' : 'Trust • Accuracy • Guidance'}
                                    </p>
                                    <div className="flex justify-center gap-6 pt-2">
                                        <Link href="/terms" className="text-[10px] text-slate-400 hover:text-indigo-600 font-medium transition-colors">Terms</Link>
                                        <Link href="/privacy" className="text-[10px] text-slate-400 hover:text-indigo-600 font-medium transition-colors">Privacy</Link>
                                    </div>
                                </div>
                            </footer>
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
            </main>
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
