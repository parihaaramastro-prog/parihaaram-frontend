
"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Heart } from "lucide-react";

export default function BlogCTA() {
    return (
        <div className="sticky top-32 hidden lg:flex flex-col gap-6">

            {/* 1. Birth Chart CTA */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 overflow-hidden relative group hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-300/50 transition-colors" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-200/50 rounded-full blur-3xl -ml-16 -mb-16 group-hover:bg-purple-300/50 transition-colors" />

                {/* Content */}
                <div className="relative z-10 space-y-6">
                    <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full w-fit border border-indigo-200">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" /> Free Tool
                        </span>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">
                            Get your Personal Birth Chart
                        </h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Discover your planetary positions and get instant insights using our advanced Vedic engine.
                        </p>
                    </div>

                    {/* Mini Chart Visual - Abstract */}
                    <div className="bg-white rounded-xl p-3 border border-indigo-100 shadow-sm">
                        <div className="grid grid-cols-3 gap-1 opacity-70">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className={`h-8 rounded-md ${i === 4 ? 'bg-indigo-100' : 'bg-slate-50'}`} />
                            ))}
                        </div>
                    </div>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-900/10"
                    >
                        Check Now <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* 2. Vibe Check CTA */}
            <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 overflow-hidden relative group hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-500">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-rose-300/50 transition-colors" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-200/50 rounded-full blur-3xl -ml-16 -mb-16 group-hover:bg-pink-300/50 transition-colors" />

                {/* Content */}
                <div className="relative z-10 space-y-6">
                    <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full w-fit border border-rose-200">
                        <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest flex items-center gap-1.5">
                            <Heart className="w-3 h-3" /> New
                        </span>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">
                            Check Your Vibe Score
                        </h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Decode your romantic chemistry with coordinate-based precision. Are you a match?
                        </p>
                    </div>

                    {/* Mini Hearts Visual */}
                    <div className="bg-white rounded-xl p-3 border border-rose-100 shadow-sm flex items-center justify-center gap-4 py-6">
                        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-rose-600">You</span>
                        </div>
                        <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-indigo-600">?</span>
                        </div>
                    </div>

                    <Link
                        href="/vibecheck"
                        className="flex items-center justify-center gap-2 w-full bg-white text-rose-600 border border-rose-200 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-50 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        Launch Protocol <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

        </div>
    );
}
