"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Calendar, Clock, MapPin, ChevronRight, Trash2, Loader2, Sparkles, User } from "lucide-react";
import { horoscopeService, SavedHoroscope } from "@/lib/services/horoscope";
import { createClient } from "@/lib/supabase";

interface SavedHoroscopesProps {
    onSelect: (horoscope: SavedHoroscope) => void;
    language?: 'en' | 'ta';
}

const TRANSLATIONS = {
    en: {
        title: "Saved Profiles",
        records: "RECORDS",
        record: "RECORD",
        syncing: "Syncing Profiles...",
        emptyTitle: "No History Found",
        emptyDesc: "Generate a report to save a profile for future analysis.",
        deleteConfirm: "Are you sure you want to remove this record?"
    },
    ta: {
        title: "சேமிக்கப்பட்ட ஜாதகங்கள்",
        records: "பதிவுகள்",
        record: "பதிவு",
        syncing: "தரவுகள் பெறப்படுகிறது...",
        emptyTitle: "வரலாறு எதுவும் இல்லை",
        emptyDesc: "எதிர்கால ஆய்விற்காக ஜாதகத்தை உருவாக்கி சேமிக்கவும்.",
        deleteConfirm: "இந்தப் பதிவை நீக்க விரும்புகிறீர்களா?"
    }
};

export default function SavedHoroscopes({ onSelect, language = 'en' }: SavedHoroscopesProps) {
    const [horoscopes, setHoroscopes] = useState<SavedHoroscope[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const t = TRANSLATIONS[language];

    const loadHoroscopes = async () => {
        setLoading(true);
        try {
            const data = await horoscopeService.getSavedHoroscopes();
            setHoroscopes(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const supabase = createClient();
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            if (session?.user) loadHoroscopes();
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) loadHoroscopes();
            else setHoroscopes([]);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm(t.deleteConfirm)) return;

        try {
            await horoscopeService.deleteHoroscope(id);
            setHoroscopes(prev => prev.filter(h => h.id !== id));
        } catch (error) {
            alert("Failed to delete record.");
        }
    };

    if (!user) return null;

    return (
        <section className="w-full max-w-4xl mx-auto space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-indigo-600" />
                    <h3 className={`text-xl font-bold text-slate-900 uppercase tracking-tight ${language === 'ta' ? 'font-tamil' : ''}`}>{t.title}</h3>
                </div>
                {horoscopes.length > 0 && (
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                        {horoscopes.length} {horoscopes.length === 1 ? t.record : t.records}
                    </span>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                    <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">{t.syncing}</p>
                </div>
            ) : horoscopes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence>
                        {horoscopes.map((h, i) => (
                            <motion.div
                                key={h.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => onSelect(h)}
                                className="group relative bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer overflow-hidden active:scale-[0.98] active:bg-slate-50 active:border-indigo-500 select-none"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-indigo-500" />
                                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{h.name}</h4>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 text-slate-500 text-[11px] font-bold uppercase tracking-wide">
                                                <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                                                <span>{h.dob}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-slate-500 text-[11px] font-bold uppercase tracking-wide">
                                                <Clock className="w-3.5 h-3.5 text-indigo-300" />
                                                <span>{h.tob}</span>
                                            </div>
                                            {h.gender && (
                                                <div className="flex items-center gap-3 text-slate-500 text-[11px] font-bold uppercase tracking-wide">
                                                    <User className="w-3.5 h-3.5 text-indigo-300" />
                                                    <span className="capitalize">{h.gender}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 text-slate-500 text-[11px] font-bold uppercase tracking-wide">
                                                <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                                                <span className="truncate max-w-[150px]">{h.pob}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={(e) => handleDelete(e, h.id)}
                                            className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="hidden sm:block p-2 rounded-lg bg-slate-900 text-white group-hover:bg-indigo-600 transition-colors shadow-sm">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="border border-dashed border-slate-200 rounded-2xl p-20 text-center space-y-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                        <History className="w-8 h-8 text-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-lg font-bold text-slate-900 uppercase tracking-tight">{t.emptyTitle}</p>
                        <p className="text-slate-400 text-xs font-medium">{t.emptyDesc}</p>
                    </div>
                </div>
            )}
        </section>
    );
}
