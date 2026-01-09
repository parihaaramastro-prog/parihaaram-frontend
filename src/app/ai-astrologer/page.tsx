"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Calendar, Clock, MapPin, ArrowRight, Star } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { profileService } from "@/lib/services/profile";
import AuthModal from "@/components/AuthModal";

export default function AIAstrologerLanding() {
    const router = useRouter();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        dob: "",
        tob: "",
        pob: ""
    });

    const handleStart = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // If not logged in, open Auth Modal
            // We save form data to local storage to hydrate later if needed, 
            // or we can pass it to the profile service once logged in.
            // For now, let's just trigger auth.
            localStorage.setItem('pending_ai_onboarding', JSON.stringify(formData));
            setIsAuthOpen(true);
            setLoading(false);
            return;
        }

        // If logged in, update profile and redirect
        try {
            if (formData.name && formData.dob && formData.tob && formData.pob) {
                await profileService.updateProfile(user.id, {
                    full_name: formData.name,
                    birth_date: formData.dob,
                    birth_time: formData.tob,
                    birth_place: formData.pob
                });
            }
            router.push('/chat');
        } catch (error) {
            console.error("Error starting chat:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#030014] text-white relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent" />

            <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left: Content */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" />
                            <span>AI-Powered Vedic Precision</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold tracking-tighter leading-tight">
                            Decode Your Destiny with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI Astrology</span>
                        </h1>

                        <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                            Get instant, personalized answers to your life's deepest questions. Our AI analyzes your birth chart with Vedic precision to provide accurate guidance.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <CheckIcon /> <span>Birth Chart Analysis</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <CheckIcon /> <span>Predictive Insights</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <CheckIcon /> <span>Relationship Compatibility</span>
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm space-y-4 shadow-2xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Start Your Free Session</h3>
                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-md border border-emerald-500/20">3 Credits Free</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[#0a0a20] border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 transition-colors outline-none"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Birth Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="date"
                                            value={formData.dob}
                                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                            className="w-full bg-[#0a0a20] border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-indigo-500 transition-colors outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Birth Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="time"
                                            value={formData.tob}
                                            onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                                            className="w-full bg-[#0a0a20] border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-indigo-500 transition-colors outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Birth Place</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            value={formData.pob}
                                            onChange={(e) => setFormData({ ...formData, pob: e.target.value })}
                                            className="w-full bg-[#0a0a20] border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-indigo-500 transition-colors outline-none"
                                            placeholder="City, Country"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleStart}
                                disabled={!formData.name || !formData.dob || !formData.tob || !formData.pob || loading}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? "Analyzing..." : "Reveal Your Future"}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <p className="text-center text-[10px] text-slate-500">By continuing, you agree to our Terms & Privacy Policy.</p>
                        </div>
                    </div>

                    {/* Right: Visual */}
                    <div className="relative hidden lg:block">
                        <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                        <div className="relative bg-[#0a0a20] border border-slate-700/50 rounded-[2.5rem] p-4 shadow-2xl">
                            <div className="absolute top-8 left-8 right-8 bottom-8 rounded-2xl overflow-hidden border border-slate-700/30">
                                {/* Chat Mockup */}
                                <div className="h-full bg-[#030014] p-6 space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-none p-4 text-sm text-slate-300 leading-relaxed border border-white/5">
                                            <p>Based on your chart, your moon sign indicates a period of significant career growth starting next month. The alignment of Jupiter suggests new opportunities in leadership roles.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 flex-row-reverse">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                            <span className="text-xs font-bold">YO</span>
                                        </div>
                                        <div className="bg-indigo-600/20 rounded-2xl rounded-tr-none p-4 text-sm text-white border border-indigo-500/20">
                                            <p>What should I focus on to maximize this growth?</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-none p-4 space-y-2 border border-white/5">
                                            <div className="w-3/4 h-2 bg-slate-700/50 rounded-full" />
                                            <div className="w-1/2 h-2 bg-slate-700/50 rounded-full" />
                                            <div className="w-5/6 h-2 bg-slate-700/50 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="absolute -bottom-8 -left-8 bg-[#0f0f29] p-4 rounded-2xl border border-slate-700/50 shadow-xl flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                                    <Star className="w-5 h-5 fill-amber-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prediction Accuracy</p>
                                    <p className="text-lg font-bold text-white">98.4%</p>
                                </div>
                            </motion.div>

                            <Image
                                src="/parihaaram-logo.png"
                                alt="App"
                                width={600}
                                height={800}
                                className="w-full h-auto opacity-20 pointer-events-none"
                            />
                        </div>
                    </div>

                </div>
            </div>

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                initialMode="signup"
            />
        </main>
    );
}

function CheckIcon() {
    return (
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
            <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
        </div>
    )
}
