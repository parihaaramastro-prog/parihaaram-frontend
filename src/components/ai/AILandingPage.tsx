"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles, Calendar, Clock, MapPin, ArrowRight, Star,
    ShieldCheck, Zap, Users, Loader2, MessageCircle,
    Quote, Heart, Briefcase, Smile
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { horoscopeService } from "@/lib/services/horoscope";
import { profileService } from "@/lib/services/profile";
import AuthModal from "@/components/AuthModal";
import DivineDatePicker from "@/components/ui/DivineDatePicker";
import DivineTimePicker from "@/components/ui/DivineTimePicker";

export default function AIAstrologerLanding() {
    const router = useRouter();
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        gender: "male", // Default
        dob: "",
        tob: "",
        pob: "",
        lat: undefined as number | undefined,
        lon: undefined as number | undefined
    });

    // Autocomplete State
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    // Click outside handler for suggestions
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Listen for Auth Changes + Pending Data
    useEffect(() => {
        const supabase = createClient();

        // Check already logged in
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                // If we are already logged in, we check if there's pending data (unlikely if they just landed, but possible if they refreshed during flow)
                // If plain navigation, redirect to chat
                const pending = localStorage.getItem('pending_ai_onboarding');
                if (!pending) {
                    router.replace('/chat');
                }
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const pending = localStorage.getItem('pending_ai_onboarding');
                if (pending) {
                    try {
                        const data = JSON.parse(pending);
                        await saveAndRedirect(session.user.id, data);
                        localStorage.removeItem('pending_ai_onboarding');
                    } catch (e) {
                        console.error("Error processing pending AI onboarding:", e);
                        // If error, maybe still redirect?
                        router.replace('/chat');
                    }
                } else {
                    // Logged in but no pending data (e.g. they just logged in via navbar)
                    router.replace('/chat');
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // City Search
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
        setFormData(prev => ({ ...prev, pob: value, lat: undefined, lon: undefined }));

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

    const saveAndRedirect = async (userId: string, data: typeof formData) => {
        // 1. Ensure User Profile Exists and Update
        await profileService.ensureProfile();
        await profileService.updateProfile(userId, {
            full_name: data.name,
            birth_date: data.dob,
            birth_time: data.tob,
            birth_place: data.pob,
            gender: data.gender // Update profile gender if applicable
        });

        // 2. Create Saved Horoscope (so it appears in chat selector)
        let savedProfileId: string | null = null;
        if (data.lat && data.lon) {
            try {
                const savedProfile = await horoscopeService.saveHoroscope({
                    name: data.name,
                    dob: data.dob,
                    tob: data.tob,
                    pob: data.pob,
                    lat: data.lat,
                    lon: data.lon,
                    gender: data.gender || 'male'
                });
                savedProfileId = savedProfile?.id || null;
            } catch (e) {
                console.warn("Could not save horoscope entry:", e);
                // Proceed anyway, profile is updated
            }
        }

        // Navigate to chat with profile ID if available
        const params = new URLSearchParams({ new: 'true' });
        if (savedProfileId) {
            params.set('profileId', savedProfileId);
        }
        router.push(`/chat?${params.toString()}`);
    };

    const handleStart = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            localStorage.setItem('pending_ai_onboarding', JSON.stringify(formData));
            setIsAuthOpen(true);
            setLoading(false);
            return;
        }

        try {
            await saveAndRedirect(user.id, formData);
        } catch (error) {
            console.error("Error starting chat:", error);
            alert("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 relative overflow-hidden font-sans">

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-50/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative pt-5 pb-20 px-4 md:px-6">
                <div className="max-w-7xl mx-auto space-y-24">

                    {/* Hero Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/5 border border-indigo-600/10 text-indigo-700 text-xs font-bold uppercase tracking-widest"
                            >
                                <Sparkles className="w-3.5 h-3.5 fill-indigo-700" />
                                <span className="text-cyan-600">AI Vedic Astrologer</span>
                            </motion.div>

                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.95]">
                                Clarity needed? <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Ask the AI.</span>
                            </h1>

                            <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed max-w-lg">
                                Experience the world's most advanced Vedic astrology AI. It calculates your birth chart in milliseconds to give you hyper-personalized answers about career, love, and life.
                            </p>

                            {/* Social Proof - Moved Up */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-3">
                                        {[
                                            "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80",
                                            "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80",
                                            "https://images.unsplash.com/photo-1589156191108-c762ff0b9655?auto=format&fit=crop&w=150&q=80",
                                            "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=150&q=80"
                                        ].map((src, i) => (
                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                                                <img src={src} alt="User" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-sm font-bold text-slate-700">
                                        Over <span className="text-emerald-600">50,000+</span> people trust us
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-amber-500">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">4.9/5 Rating</span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Form Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-2xl shadow-indigo-500/10 relative group hover:border-indigo-500/20 transition-all z-20">
                            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-6 py-2 rounded-bl-2xl uppercase tracking-widest z-10 shadow-lg">
                                Try It Free
                            </div>

                            <div className="relative z-10 space-y-8">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Reveal Your Deepest Desires & Hidden Destiny</h3>

                                <div className="space-y-5">

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 md:col-span-1 space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all placeholder:font-medium placeholder:text-slate-400"
                                                placeholder="Enter full name"
                                            />
                                        </div>

                                        <div className="col-span-2 md:col-span-1 space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Gender</label>
                                            <select
                                                value={formData.gender}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all cursor-pointer appearance-none"
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block">Birth Date</label>
                                            <DivineDatePicker
                                                value={formData.dob}
                                                onChange={(date) => setFormData({ ...formData, dob: date })}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block">Birth Time</label>
                                            <DivineTimePicker
                                                value={formData.tob}
                                                onChange={(time) => setFormData({ ...formData, tob: time })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 relative" ref={suggestionsRef}>
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Place of Birth</label>
                                        <div className="relative">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                                                {isSearching ? <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" /> : <MapPin className="w-4 h-4 text-slate-400" />}
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.pob}
                                                onChange={handlePobChange}
                                                className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all placeholder:font-medium placeholder:text-slate-400 ${formData.pob && !formData.lat ? 'border-amber-300' : 'border-slate-200'}`}
                                                placeholder="Search city..."
                                                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
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

                                        {formData.pob && !formData.lat && (
                                            <p className="text-[10px] text-amber-600 font-bold mt-1 ml-1 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                Please select a valid city from the list
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleStart}
                                    disabled={!formData.name || !formData.dob || !formData.tob || !formData.lat || loading}
                                    className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold uppercase tracking-widest shadow-xl hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
                                >
                                    {loading ? "Analyzing Chart..." : "Get My Free Prediction"}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>

                                <p className="text-center text-[10px] text-slate-400 font-medium">
                                    By proceeding, you agree to our Terms. Your data is private.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sample Questions Section - New */}
                    <div className="space-y-10">
                        <div className="text-center max-w-2xl mx-auto space-y-4">
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Capabilities</span>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">What can you ask?</h2>
                            <p className="text-slate-500 font-medium">Our AI understands your unique planetary positions. Ask specific questions and get detailed, chart-based answers.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SampleCard
                                icon={<Briefcase className="w-6 h-6 text-blue-500" />}
                                question="Why am I not getting a job?"
                                desc="Analyze planetary blocks in your career house (10th house) and find out when the timing is right."
                            />
                            <SampleCard
                                icon={<Heart className="w-6 h-6 text-rose-500" />}
                                question="Will my ex come back?"
                                desc="Check compatibility and Venus/Mars transits to see if reconnection is written in your stars."
                            />
                            <SampleCard
                                icon={<Smile className="w-6 h-6 text-amber-500" />}
                                question="Why do I feel so lost?"
                                desc="Understand if you are going through Sade Sati or a difficult Dasha period and get remedies."
                            />
                        </div>
                    </div>

                    {/* Testimonials Grid - Reorganized */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12">
                        <div className="col-span-1 lg:col-span-3 text-center mb-8">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Real Stories from Users</h2>
                        </div>
                        <TestimonialCard
                            name="Priya Menon"
                            place="Kochi"
                            image="https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=150&q=80"
                            text="I was consulting astrologers for years about my marriage delay. The AI pointed out a specific Dosha that others missed and suggested a simple remedy. I got engaged 3 months later!"
                        />
                        <TestimonialCard
                            name="Rajesh Kumar"
                            place="Delhi"
                            image="https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80"
                            text="I asked 'When will I get a promotion?' and it gave me a date range. It happened exactly in that week. The precision is actually scary."
                        />
                        <TestimonialCard
                            name="Amit Patel"
                            place="Ahmedabad"
                            image="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=150&q=80"
                            text="Much better than generic horoscopes. It explains WHY things are happening based on my chart. Helped me navigate a very tough business loss."
                        />
                    </div>

                </div>
            </div>

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                initialMode="signup"
                customTitle="Unlock Your Destiny"
                customDescription="Join thousands of others. Create your free account to reveal your personal birth chart analysis instantly."
            />
        </main>
    );
}

function SampleCard({ icon, question, desc }: any) {
    return (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl hover:border-indigo-100 transition-all group cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-indigo-700 transition-colors">"{question}"</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
        </div>
    )
}

function TestimonialCard({ name, place, text, image }: any) {
    return (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all relative">
            <Quote className="w-8 h-8 text-indigo-100 absolute top-6 right-6 fill-indigo-50" />
            <div className="flex items-center gap-1 mb-4 text-amber-500">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
            </div>
            <p className="text-slate-600 font-medium leading-relaxed mb-6">"{text}"</p>
            <div className="flex items-center gap-4">
                <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" />
                <div>
                    <p className="text-sm font-bold text-slate-900">{name}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{place}</p>
                </div>
            </div>
        </div>
    )
}
