"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, Sparkles, User, Loader2 } from "lucide-react";

interface HoroscopeFormProps {
    onCalculate: (data: { name: string; dob: string; tob: string; pob: string; lat?: number; lon?: number }) => void;
    loading: boolean;
    language?: 'en' | 'ta';
    initialData?: { name?: string; dob: string; tob: string; pob: string; lat?: number; lon?: number } | null;
}

const TRANSLATIONS = {
    en: {
        name: "Name",
        namePlaceholder: "Enter your full name",
        dob: "Date of Birth",
        tob: "Time of Birth",
        pob: "Place of Birth",
        pobPlaceholder: "City, State / Country",
        calculate: "Calculate Birth Chart",
        computation: "Real-Time Computation",
        engine: "HIGH-PRECISION ENGINE"
    },
    ta: {
        name: "பெயர்",
        namePlaceholder: "உங்கள் பெயர்",
        dob: "பிறந்த தேதி",
        tob: "பிறந்த நேரம்",
        pob: "பிறந்த இடம்",
        pobPlaceholder: "நகரம் / நாடு",
        calculate: "ஜாதகம் கணக்கிடுக",
        computation: "நேரடி கணக்கீடு",
        engine: "துல்லியமான இயந்திரம்"
    }
};

export default function HoroscopeForm({ onCalculate, loading, language = 'en', initialData }: HoroscopeFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        dob: initialData?.dob || "",
        tob: initialData?.tob || "",
        pob: initialData?.pob || "",
        lat: initialData?.lat,
        lon: initialData?.lon
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                dob: initialData.dob || "",
                tob: initialData.tob || "",
                pob: initialData.pob || "",
                lat: initialData.lat,
                lon: initialData.lon
            });
        }
    }, [initialData]);

    // Autocomplete states
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const t = TRANSLATIONS[language];

    // Close suggestions on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchSuggestions = async (query: string) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
            );
            const data = await response.json();
            setSuggestions(data || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Error fetching places:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handlePobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, pob: value, lat: undefined, lon: undefined })); // Reset coords on manual edit

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 500);
    };

    const selectPlace = (place: any) => {
        setFormData(prev => ({
            ...prev,
            pob: place.display_name,
            lat: parseFloat(place.lat),
            lon: parseFloat(place.lon)
        }));
        setShowSuggestions(false);
        setSuggestions([]);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl mx-auto bg-white border border-slate-200 rounded-xl p-5 sm:p-6 md:p-10 relative overflow-visible shadow-xl text-left"
        >
            <div className="absolute top-0 right-0 p-4 sm:p-6 flex items-center gap-2 opacity-30 select-none">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{t.computation}</span>
            </div>

            <div className="space-y-5 relative z-10 w-full">
                <div className="w-full">
                    <label className="divine-label">{t.name}</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                            <User className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder={t.namePlaceholder}
                            className="divine-input !pl-12"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="w-full">
                        <label className="divine-label">{t.dob}</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                                <Calendar className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            </div>
                            <input
                                type="date"
                                className="divine-input !pl-12"
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="w-full">
                        <label className="divine-label">{t.tob}</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                                <Clock className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            </div>
                            <input
                                type="time"
                                className="divine-input !pl-12"
                                value={formData.tob}
                                onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full relative" ref={suggestionsRef}>
                    <label className="divine-label">{t.pob}</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                            {isSearching ? (
                                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                            ) : (
                                <MapPin className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            )}
                        </div>
                        <input
                            type="text"
                            placeholder={t.pobPlaceholder}
                            className="divine-input !pl-12"
                            value={formData.pob}
                            onChange={handlePobChange}
                            onFocus={() => {
                                if (suggestions.length > 0) setShowSuggestions(true);
                            }}
                        />
                    </div>

                    {/* Autocomplete Dropdown */}
                    <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto"
                            >
                                {suggestions.map((place, index) => (
                                    <button
                                        key={index}
                                        onClick={() => selectPlace(place)}
                                        className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex items-start gap-3"
                                    >
                                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                        <span className="truncate">{place.display_name}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={loading || !formData.name || !formData.dob || !formData.tob || !formData.pob}
                    onClick={() => onCalculate(formData)}
                    className="divine-button w-full h-12 flex items-center justify-center gap-3 mt-4"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4" />
                            <span className={`text-sm font-bold uppercase tracking-widest ${language === 'ta' ? 'font-tamil' : ''}`}>{t.calculate}</span>
                        </>
                    )}
                </motion.button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center opacity-30">
                <span className="text-[10px] font-bold tracking-[0.1em] text-slate-600 uppercase">{t.engine}</span>
                <span className="text-[10px] font-bold tracking-[0.1em] text-slate-600 text-right">VERSION 2.4.0</span>
            </div>
        </motion.div>
    );
}
