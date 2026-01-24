"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RASHI_PREDICTIONS, LAGNA_PREDICTIONS, RASHI_PREDICTIONS_TA, LAGNA_PREDICTIONS_TA } from "@/lib/predictions-2026";
import Link from "next/link";
import { ArrowRight, Star, Sparkles, User, Moon, Languages } from "lucide-react";

export default function PredictionsPage() {
    const [mode, setMode] = useState<'rashi' | 'lagna'>('rashi');
    const [lang, setLang] = useState<'en' | 'ta'>('en');

    // Select the correct dataset based on Mode AND Language
    let dataSet;
    if (lang === 'en') {
        dataSet = mode === 'rashi' ? RASHI_PREDICTIONS : LAGNA_PREDICTIONS;
    } else {
        dataSet = mode === 'rashi' ? RASHI_PREDICTIONS_TA : LAGNA_PREDICTIONS_TA;
    }

    return (
        <main className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 sticky-header-bg" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 space-y-16">
                {/* Header */}
                <div className="text-center space-y-6 text-white pt-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-widest backdrop-blur-md"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>{lang === 'ta' ? 'ஜோதிட கணிப்பு' : 'Vedic Insights'}</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight" style={lang === 'ta' ? { lineHeight: 1.4 } : {}}>
                        2026 {lang === 'ta' ? 'ஆண்டு' : 'Annual'} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">
                            {lang === 'ta' ? 'ராசி பலன்கள்' : 'Predictions'}
                        </span>
                    </h1>
                    <p className="text-xl text-indigo-100/80 max-w-2xl mx-auto leading-relaxed">
                        {lang === 'ta'
                            ? 'உங்கள் ராசி அல்லது லக்னத்தின் அடிப்படையில் 2026 ஆம் ஆண்டிற்கான விரிவான பலன்கள்.'
                            : 'Explore specific guidance based on either your Moon Sign (Rashi) or Ascendant (Lagna).'}
                    </p>

                    {/* Unified Toggle Controls */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-10">
                        {/* Type Toggle */}
                        <div className="bg-slate-900/80 p-1.5 rounded-2xl flex items-center border border-slate-700/50 shadow-xl">
                            <button
                                onClick={() => setMode('rashi')}
                                className="relative flex items-center justify-center gap-2 px-6 py-3 min-w-[140px] rounded-xl text-sm font-bold uppercase tracking-widest transition-all outline-none"
                            >
                                {mode === 'rashi' && (
                                    <motion.div
                                        layoutId="mode-pill"
                                        className="absolute inset-0 bg-white rounded-xl shadow-md"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className={`relative z-10 flex items-center gap-2 ${mode === 'rashi' ? 'text-slate-900' : 'text-slate-400 hover:text-white transition-colors'}`}>
                                    <Moon className="w-4 h-4" />
                                    {lang === 'ta' ? 'ராசி' : 'Rashi'}
                                </span>
                            </button>
                            <button
                                onClick={() => setMode('lagna')}
                                className="relative flex items-center justify-center gap-2 px-6 py-3 min-w-[140px] rounded-xl text-sm font-bold uppercase tracking-widest transition-all outline-none"
                            >
                                {mode === 'lagna' && (
                                    <motion.div
                                        layoutId="mode-pill"
                                        className="absolute inset-0 bg-white rounded-xl shadow-md"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className={`relative z-10 flex items-center gap-2 ${mode === 'lagna' ? 'text-slate-900' : 'text-slate-400 hover:text-white transition-colors'}`}>
                                    <User className="w-4 h-4" />
                                    {lang === 'ta' ? 'லக்னம்' : 'Lagna'}
                                </span>
                            </button>
                        </div>

                        {/* Language Toggle */}
                        <div className="bg-slate-900/80 p-1.5 rounded-2xl flex items-center border border-slate-700/50 shadow-xl">
                            <button
                                onClick={() => setLang('en')}
                                className="relative flex items-center justify-center gap-2 px-6 py-3 min-w-[100px] rounded-xl text-xs font-bold uppercase tracking-widest transition-all outline-none"
                            >
                                {lang === 'en' && (
                                    <motion.div
                                        layoutId="lang-pill"
                                        className="absolute inset-0 bg-white rounded-xl shadow-md"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className={`relative z-10 ${lang === 'en' ? 'text-slate-900' : 'text-slate-400 hover:text-white transition-colors'}`}>
                                    ENG
                                </span>
                            </button>
                            <button
                                onClick={() => setLang('ta')}
                                className="relative flex items-center justify-center gap-2 px-6 py-3 min-w-[100px] rounded-xl text-xs font-bold uppercase tracking-widest transition-all outline-none"
                            >
                                {lang === 'ta' && (
                                    <motion.div
                                        layoutId="lang-pill"
                                        className="absolute inset-0 bg-white rounded-xl shadow-md"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className={`relative z-10 ${lang === 'ta' ? 'text-slate-900' : 'text-slate-400 hover:text-white transition-colors'}`}>
                                    தமிழ்
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid of Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.entries(dataSet).map(([sign, data], index) => (
                        <Link href={`/predictions/${mode}/${sign}?lang=${lang}`} key={sign}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 border border-slate-200 transition-all group hover:-translate-y-1 h-full flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 font-bold font-serif">
                                        {/* If Tamil, we might want to show first letter or something else, but English generic is fine for icon */
                                            sign.substring(0, 2)
                                        }
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${mode === 'rashi' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {lang === 'ta'
                                            ? (mode === 'rashi' ? 'ராசி' : 'லக்னம்')
                                            : (mode === 'rashi' ? 'Moon Sign' : 'Ascendant')
                                        }
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold text-slate-900 mb-3">{data.title.split(' 2026')[0]}</h2>
                                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                                    {data.overview}
                                </p>

                                <div className="space-y-3 pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-sm text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">
                                        {lang === 'ta' ? 'மேலும் படிக்க' : 'Read Full Analysis'} <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Need a Personalized Analysis?</h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            While these general predictions give you a glimpse, your unique birth chart holds the specific keys to your destiny.
                        </p>
                        <Link href="/" className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform">
                            Calculate My Full Horoscope <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
