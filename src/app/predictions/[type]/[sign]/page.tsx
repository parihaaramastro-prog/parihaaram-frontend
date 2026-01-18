"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { RASHI_PREDICTIONS, LAGNA_PREDICTIONS, RASHI_PREDICTIONS_TA, LAGNA_PREDICTIONS_TA, DetailedPrediction } from "@/lib/predictions-2026";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Heart, TrendingUp, Activity, Calendar, ShieldCheck } from "lucide-react";

function DetailedPredictionContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') || 'en';

    const type = params.type as string; // 'rashi' or 'lagna'
    const sign = params.sign as string;

    const [data, setData] = useState<DetailedPrediction | null>(null);

    useEffect(() => {
        if (!type || !sign) return;

        let dataSet;
        if (lang === 'ta') {
            dataSet = type === 'rashi' ? RASHI_PREDICTIONS_TA : LAGNA_PREDICTIONS_TA;
        } else {
            dataSet = type === 'rashi' ? RASHI_PREDICTIONS : LAGNA_PREDICTIONS;
        }

        // Case insensitive search
        const match = Object.keys(dataSet).find(k => k.toLowerCase() === sign.toLowerCase());

        if (match) {
            setData(dataSet[match]);
        } else {
            // Handle not found
        }
    }, [type, sign, router, lang]);

    if (!data) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

    const labels = {
        back: lang === 'ta' ? 'திரும்பச் செல்ல' : 'Back to Overview',
        moonSign: lang === 'ta' ? 'ராசி பலன்' : 'Moon Sign Prediction',
        ascendant: lang === 'ta' ? 'லக்ன பலன்' : 'Ascendant Prediction',
        career: lang === 'ta' ? 'தொழில் & வளர்ச்சி' : 'Career & Growth',
        wealth: lang === 'ta' ? 'செல்வம் & சொத்து' : 'Wealth & Assets',
        love: lang === 'ta' ? 'காதல் & உறவுகள்' : 'Love & Relationships',
        health: lang === 'ta' ? 'உடல்நலம் & ஆரோக்கியம்' : 'Health & Vitality',
        timeline: lang === 'ta' ? '2026 காலவரிசை' : '2026 Timeline',
        remedies: lang === 'ta' ? 'பரிகாரங்கள்' : 'Vedic Remedies',
        remedyDesc: lang === 'ta' ? 'சவால்களைக் குறைக்கவும், நற்பலன்களை அதிகரிக்கவும் எளிய பரிகாரங்கள்:' : 'To mitigate challenges and enhance positive effects, perform these simple remedies:'
    };

    const RatingStars = ({ rating }: { rating: number }) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className={`w-2 h-2 rounded-full ${s <= rating ? 'bg-amber-400' : 'bg-slate-200'}`} />
            ))}
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header / Hero */}
            <div className="relative bg-slate-900 pt-32 pb-24 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5980?auto=format&fit=crop&q=80')] opacity-10 mix-blend-overlay bg-cover bg-center" />

                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
                    <Link href={`/predictions?lang=${lang}`} className="inline-flex items-center gap-2 text-indigo-300 hover:text-white mb-4 text-xs font-bold uppercase tracking-widest transition-colors">
                        <ArrowLeft className="w-4 h-4" /> {labels.back}
                    </Link>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`inline-block px-6 py-2 rounded-full border text-xs font-bold uppercase tracking-[0.2em] ${type === 'rashi' ? 'bg-indigo-500/20 border-indigo-400/30 text-indigo-200' : 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200'}`}
                    >
                        {type === 'rashi' ? labels.moonSign : labels.ascendant}
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight" style={{ lineHeight: 1.3 }}>{data.title}</h1>
                    <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">{data.overview}</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-20 pb-24 space-y-8">
                {/* Key Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Career */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
                            <RatingStars rating={data.career.rating} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{labels.career}</h3>
                            <p className="text-sm font-bold text-blue-600 mt-1">{data.career.summary}</p>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{data.career.details}</p>
                    </motion.div>

                    {/* Finance */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Star className="w-6 h-6" /></div>
                            <RatingStars rating={data.finance.rating} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{labels.wealth}</h3>
                            <p className="text-sm font-bold text-emerald-600 mt-1">{data.finance.summary}</p>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{data.finance.details}</p>
                    </motion.div>

                    {/* Love */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Heart className="w-6 h-6" /></div>
                            <RatingStars rating={data.love.rating} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{labels.love}</h3>
                            <p className="text-sm font-bold text-rose-600 mt-1">{data.love.summary}</p>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{data.love.details}</p>
                    </motion.div>

                    {/* Health */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl"><Activity className="w-6 h-6" /></div>
                            <RatingStars rating={data.health.rating} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{labels.health}</h3>
                            <p className="text-sm font-bold text-teal-600 mt-1">{data.health.summary}</p>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{data.health.details}</p>
                    </motion.div>
                </div>

                {/* Quarterly Breakdown & Remedies */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    <div className="md:col-span-2 space-y-6">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-600" /> {labels.timeline}
                        </h3>
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                            {Object.entries(data.quarters).map(([q, text]) => (
                                <div key={q} className="p-6 flex gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="w-12 shrink-0 pt-1">
                                        <span className="text-xs font-black uppercase text-slate-400 tracking-wider block">{q.toUpperCase()}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm font-medium leading-relaxed">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-600" /> {labels.remedies}
                        </h3>
                        <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100 space-y-6">
                            <p className="text-emerald-800 text-sm font-medium leading-relaxed">
                                {labels.remedyDesc}
                            </p>
                            <ul className="space-y-4">
                                {data.remedies.map((r, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-emerald-900 font-bold">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function DetailedPredictionPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <DetailedPredictionContent />
        </Suspense>
    );
}
