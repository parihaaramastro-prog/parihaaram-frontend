"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, ArrowRight, Loader2, Zap, Clock, MapPin, X } from "lucide-react";
import { calculateVibe } from "@/lib/compatibility";
import AuthModal from "./AuthModal";
import { createClient } from "@/lib/supabase";
import { horoscopeService } from "@/lib/services/horoscope";

interface PartnerInput {
    name: string;
    dob: string;
    tob: string; // Default to 12:00
    pob: string; // Default to Chennai or simplistic
    lat: number;
    lon: number;
    gender?: string;
}

const DEFAULT_COORDS = { lat: 13.0827, lon: 80.2707 }; // Chennai as fallback/default

export default function VibeCheck() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1=Input, 2=Loading, 3=Result
    const [p1, setP1] = useState<PartnerInput>({ name: "", dob: "", tob: "12:00", pob: "Chennai, India", ...DEFAULT_COORDS });
    const [p2, setP2] = useState<PartnerInput>({ name: "", dob: "", tob: "12:00", pob: "Chennai, India", ...DEFAULT_COORDS });
    const [result, setResult] = useState<any>(null);
    const [showShareCard, setShowShareCard] = useState(false);

    // Funnel State
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Check for pending funnel data on mount
    // Check for pending funnel data on mount and auth change
    useEffect(() => {
        const supabase = createClient();

        const checkPending = async (user: any) => {
            const pending = localStorage.getItem('vibe_pending');

            if (pending && user) {
                setShowAuthModal(false); // Close modal if open
                setStep(2); // Show loading style

                // Small delay to ensure UI updates
                setTimeout(async () => {
                    try {
                        const { p1: fp1, p2: fp2 } = JSON.parse(pending);

                        // 1. Calculate Chart Data for Primary (You)
                        const res1 = await fetch('/api/astrology', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(fp1)
                        });
                        const data1 = await res1.json();
                        fp1.chart_data = data1;

                        // 2. Calculate Chart Data for Secondary (Partner)
                        const res2 = await fetch('/api/astrology', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(fp2)
                        });
                        const data2 = await res2.json();
                        fp2.chart_data = data2;

                        // 3. Save to DB
                        await horoscopeService.saveHoroscope(fp1);
                        await horoscopeService.saveHoroscope(fp2);

                        localStorage.removeItem('vibe_pending');
                        router.push('/chat?new=vibecheck');
                    } catch (e) {
                        console.error(e);
                        setStep(3); // Go back to result on error
                        alert("Error saving profiles. Please try again.");
                    }
                }, 500);
            }
        };

        // Check initially
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) checkPending(user);
        });

        // Listen for Auth Changes (e.g. after Email Login modal closes)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                checkPending(session.user);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const checkVibe = async () => {
        setStep(2);
        try {
            // Fetch P1
            const res1 = await fetch('/api/astrology', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p1)
            });
            const data1 = await res1.json();

            // Fetch P2
            const res2 = await fetch('/api/astrology', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p2)
            });
            const data2 = await res2.json();

            if (!data1.nakshatra || !data2.nakshatra) throw new Error("Could not calculate positions");

            const vibe = calculateVibe(
                data1.nakshatra.idx,
                data2.nakshatra.idx,
                data1.moon_sign.idx,
                data2.moon_sign.idx
            );

            setResult({ vibe, p1Data: data1, p2Data: data2 });
            setStep(3);

        } catch (e) {
            console.error(e);
            setStep(1);
            alert("Oops! Couldn't align the stars. Check the dates and try again.");
        }
    };

    const handleDeepDive = () => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                // If logged in, save and go to chat
                localStorage.setItem('vibe_pending', JSON.stringify({ p1, p2 }));
                router.push('/chat?new=vibecheck'); // Will trigger the pending check logic (or we can duplicate save logic here)
                // Actually safer to assume effect handles it or do it here.
                // Let's do it here for instant feedback.
                // ... (Logic duplicates effect, but cleaner to just let effect run on chat page? No, effect is here.)
                // Let's rely on reload or direct function call.
                // Simplest: Just use the pending logic.
                window.location.reload();
            } else {
                setShowDetailModal(true);
            }
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 md:p-12 bg-white rounded-[3rem] shadow-xl border border-slate-200 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-[80px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -z-10" />

            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest mb-4">
                    <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    Compatibility Lab
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                    The <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-600">Vibe Check</span>
                </h2>
                <p className="text-slate-500 text-lg max-w-lg mx-auto">
                    Decode your chemistry. Is it a karmic lesson or an electric connection?
                </p>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative"
                    >
                        {/* Divider */}
                        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white border border-slate-200 rounded-full items-center justify-center z-10 shadow-sm font-serif italic text-slate-400">
                            &
                        </div>

                        {/* Person 1 */}
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-slate-900 uppercase tracking-widest">You</label>
                            <input
                                type="text"
                                placeholder="Your Name"
                                className="w-full p-4 bg-slate-50 border-0 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={p1.name}
                                onChange={e => setP1({ ...p1, name: e.target.value })}
                            />
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                <input
                                    type="date"
                                    className="w-full p-4 bg-slate-50 border-0 rounded-xl font-medium text-slate-600 outline-none"
                                    value={p1.dob}
                                    onChange={e => setP1({ ...p1, dob: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Person 2 */}
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-slate-900 uppercase tracking-widest">Partner / Crush</label>
                            <input
                                type="text"
                                placeholder="Their Name"
                                className="w-full p-4 bg-slate-50 border-0 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                                value={p2.name}
                                onChange={e => setP2({ ...p2, name: e.target.value })}
                            />
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                <input
                                    type="date"
                                    className="w-full p-4 bg-slate-50 border-0 rounded-xl font-medium text-slate-600 outline-none"
                                    value={p2.dob}
                                    onChange={e => setP2({ ...p2, dob: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-6 text-center">
                            <button
                                onClick={checkVibe}
                                disabled={!p1.dob || !p2.dob}
                                className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Sparkles className="w-4 h-4" />
                                Run Compatibility Protocol
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-slate-900">Aligning Planetary Grids...</h3>
                        <p className="text-slate-500">Comparing Nakshatra interference patterns.</p>
                    </motion.div>
                )}

                {step === 3 && result && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="mb-8 p-1 rounded-full bg-gradient-to-r from-pink-500 via-indigo-500 to-cyan-500 w-32 h-32 mx-auto flex items-center justify-center">
                            <div className="bg-white w-full h-full rounded-full flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-slate-900">{result.vibe.score}%</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Match</span>
                            </div>
                        </div>

                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                            {result.vibe.title}
                        </h3>
                        <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto leading-relaxed">
                            {result.vibe.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-10">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dynamic</p>
                                <p className="font-bold text-indigo-600">{result.vibe.dynamic}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Star Link</p>
                                <div className="flex flex-col text-xs font-bold text-slate-900">
                                    <span>{result.p1Data.nakshatra.name}</span>
                                    <span className="text-slate-400 text-[8px]">+</span>
                                    <span>{result.p2Data.nakshatra.name}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center mb-10">
                            <button
                                onClick={() => setShowShareCard(true)}
                                className="relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-pink-500/30 overflow-hidden w-full max-w-xs"
                            >
                                <div className="absolute inset-0 bg-white/20 blur-xl group-hover:bg-white/30 transition-colors" />
                                <span className="relative z-10 flex items-center gap-2">
                                    <span className="text-lg">📸</span> Share to Story
                                </span>
                            </button>
                        </div>

                        {/* Story Card Modal */}
                        {showShareCard && (
                            <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setShowShareCard(false)}>
                                <div className="w-full max-w-sm space-y-6" onClick={e => e.stopPropagation()}>
                                    {/* The Card to Screenshot */}
                                    <div id="story-card" className="aspect-[9/16] w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center relative shadow-2xl overflow-hidden border-4 border-white/20">
                                        {/* Dynamic Bg */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-[80px] opacity-30 animate-pulse" />
                                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400 rounded-full blur-[80px] opacity-30" />

                                        {/* Content */}
                                        <div className="relative z-10 space-y-6">
                                            <div className="inline-block px-4 py-1 rounded-full bg-black/20 text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm border border-white/10">
                                                Vibe Check
                                            </div>

                                            <div className="space-y-2">
                                                <h2 className="text-xl font-bold text-white/90">{p1.name} + {p2.name}</h2>
                                                <div className="text-8xl font-black text-white drop-shadow-xl tracking-tighter">
                                                    {result.vibe.score}%
                                                </div>
                                            </div>

                                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                                                <h3 className="text-2xl font-bold text-white mb-2">{result.vibe.title}</h3>
                                                <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                                                    "{result.vibe.description}"
                                                </p>
                                            </div>

                                            <div className="pt-8 opacity-80">
                                                <p className="text-[10px] font-bold text-white uppercase tracking-widest">
                                                    parihaaram.in/vibecheck
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-3">
                                        <p className="text-center text-white/50 text-xs font-bold uppercase tracking-widest animate-pulse">
                                            Saving Image... 📸
                                        </p>
                                        <button
                                            onClick={async () => {
                                                const text = `We got a ${result.vibe.score}% match. ${result.vibe.title}. 💀 Check yours at parihaaram.in/vibecheck`;
                                                navigator.clipboard.writeText(text);

                                                const node = document.getElementById('story-card');
                                                if (node) {
                                                    try {
                                                        const { toBlob } = await import('html-to-image');
                                                        const blob = await toBlob(node);

                                                        if (blob) {
                                                            const file = new File([blob], "vibe-check.png", { type: "image/png" });

                                                            // Try Native Share (Mobile)
                                                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                                                await navigator.share({
                                                                    files: [file],
                                                                    title: 'Vibe Check Result',
                                                                    text: text
                                                                });
                                                            } else {
                                                                // Fallback to Download (Desktop)
                                                                const url = URL.createObjectURL(blob);
                                                                const link = document.createElement('a');
                                                                link.download = `vibe-check-${result.vibe.score}.png`;
                                                                link.href = url;
                                                                link.click();
                                                                alert("Image Saved & Caption Copied! Open Instagram -> Story -> Select Image ⚡");
                                                            }
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert("Could not share automatically. Please screenshot!");
                                                    }
                                                }
                                            }}
                                            className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-slate-50 transition-colors"
                                        >
                                            Share / Download Card
                                        </button>
                                        <button
                                            onClick={() => setShowShareCard(false)}
                                            className="w-full py-3 text-white/50 font-bold text-xs uppercase tracking-widest hover:text-white"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-indigo-900 text-white p-8 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                            <div className="relative z-10">
                                <h4 className="text-xl font-bold mb-2">Want the deeper truth?</h4>
                                <p className="text-indigo-200 text-sm mb-6 max-w-md mx-auto">
                                    Chemistry is one thing. Timing is another. Ask the AI Astrologer if your Dasha Timelines support a long-term future.
                                </p>
                                <button
                                    onClick={handleDeepDive}
                                    className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors inline-flex items-center gap-2"
                                >
                                    Create Account & Ask AI <ArrowRight className="w-3 h-3" />
                                </button>
                                <p className="text-center mt-3 text-[10px] text-indigo-300 uppercase tracking-widest font-bold">2 Free Messages Included</p>
                            </div>
                            {/* Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity" />
                        </div>

                        <button
                            onClick={() => setStep(1)}
                            className="mt-6 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600"
                        >
                            Check Another Couple
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Detailed Input Modal */}
            {showDetailModal && (
                <div className="fixed inset-0 z-[80] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Complete the Chart</h3>
                            <button onClick={() => setShowDetailModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <p className="text-sm text-indigo-800">
                                    To generate an <strong>accurate timeline prediction</strong>, the AI needs the exact time and place of birth.
                                </p>
                            </div>

                            {/* P1 Details */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">1</span>
                                    <h4 className="font-bold text-sm text-slate-900">{p1.name} (You)</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Time</label>
                                        <input
                                            type="time"
                                            value={p1.tob}
                                            onChange={e => setP1({ ...p1, tob: e.target.value })}
                                            className="w-full p-3 bg-slate-50 rounded-lg text-sm font-medium outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Place</label>
                                        <input
                                            type="text"
                                            value={p1.pob}
                                            onChange={e => setP1({ ...p1, pob: e.target.value })}
                                            placeholder="City, Country"
                                            className="w-full p-3 bg-slate-50 rounded-lg text-sm font-medium outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* P2 Details */}
                            <div className="space-y-3 pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">2</span>
                                    <h4 className="font-bold text-sm text-slate-900">{p2.name} (Partner)</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Time</label>
                                        <input
                                            type="time"
                                            value={p2.tob}
                                            onChange={e => setP2({ ...p2, tob: e.target.value })}
                                            className="w-full p-3 bg-slate-50 rounded-lg text-sm font-medium outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Place</label>
                                        <input
                                            type="text"
                                            value={p2.pob}
                                            onChange={e => setP2({ ...p2, pob: e.target.value })}
                                            placeholder="City, Country"
                                            className="w-full p-3 bg-slate-50 rounded-lg text-sm font-medium outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    localStorage.setItem('vibe_pending', JSON.stringify({ p1, p2 }));
                                    setShowDetailModal(false);
                                    setShowAuthModal(true);
                                }}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-[1.02] transition-transform"
                            >
                                Continue to Free Analysis
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                customTitle="Unlock Compatibility Insight"
                customDescription="Create a free account to generate your detailed Dasha Timeline report."
            />
        </div>
    );
}
