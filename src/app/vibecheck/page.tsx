"use client";

import { motion } from "framer-motion";
import VibeCheck from "@/components/VibeCheck";
import Link from "next/link";
import { ArrowLeft, Sparkles, Zap, Heart, Lock } from "lucide-react";

export default function VibeCheckPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between relative z-50">
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors mb-8">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white fill-white" />
                    </div>
                    <span className="font-bold text-slate-900 tracking-tight">Vibe<span className="text-indigo-600">Check</span></span>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto px-6 pb-24 space-y-24">
                {/* Hero / Tool Section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <span className="inline-block px-4 py-1.5 rounded-full bg-pink-50 text-pink-600 text-[10px] font-bold uppercase tracking-widest border border-pink-100">
                                Relationship Intelligence Protocol
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">
                                Is it <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-600">Love</span> or just <span className="text-slate-400">Chaos?</span>
                            </h1>
                            <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
                                Don't guess. Our algorithm decodes your "Nakshatra Resonance" to reveal the raw chemistry score.
                                <br /><br />
                                <strong className="text-slate-900">It's not magic. It's coordinate math.</strong>
                            </p>
                        </motion.div>

                        <div className="flex gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-pink-500" /> Free Analysis
                            </span>
                            <span className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500" /> Instant Results
                            </span>
                        </div>
                    </div>

                    {/* The Tool */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <VibeCheck />
                    </motion.div>
                </div>

                {/* The "Why Pay" Value Prop Section */}
                <div className="relative rounded-[3rem] bg-indigo-950 overflow-hidden text-center py-24 px-6 md:px-12">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600 rounded-full blur-[150px] opacity-20" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600 rounded-full blur-[150px] opacity-30" />

                    <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 mb-4">
                            <Lock className="w-8 h-8 text-indigo-300" />
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                            The "Score" is just the surface.
                        </h2>
                        <p className="text-lg text-indigo-200 leading-relaxed">
                            A 90% match can still fail if the timing is wrong. Our AI Subscription unlocks the <strong>Deep Timeline Analysis</strong>.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6 text-left pt-8">
                            {[
                                { title: "Dasha Timing", desc: "Is one of you entering a 'Separation Period'?" },
                                { title: "Karmic Debt", desc: "Who owes whom? Understanding the power dynamic." },
                                { title: "Survival Strategy", desc: "Specific dates to avoid huge fights." }
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
                                    <h3 className="text-white font-bold mb-2">{item.title}</h3>
                                    <p className="text-indigo-300 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8">
                            <Link href="/chat">
                                <button className="bg-white text-indigo-950 px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 hover:scale-105 transition-all shadow-xl shadow-indigo-900/50">
                                    Unlock Full Report (Start Trial)
                                </button>
                            </Link>
                            <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mt-4">
                                3 Free Queries Included
                            </p>
                        </div>
                    </div>
                </div>


            </main>
        </div>
    );
}
