"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Moon, Star, Sparkles, Map, Calendar, Info,
    ChevronRight, ChevronDown, Bookmark, Loader2, Check,
    MessageSquare, History, Clock
} from "lucide-react";
import {
    AstrologyResults, Mahadasha, NAKSHATRAS_TAMIL
} from "@/lib/astrology";
import SouthIndianChart from "./SouthIndianChart";
import { horoscopeService } from "@/lib/services/horoscope";
import { createClient } from "@/lib/supabase";

interface HoroscopeResultProps {
    results: AstrologyResults;
    onReset: () => void;
    inputData: { name?: string; dob: string; tob: string; pob: string; lat: number; lon: number };
    language?: 'en' | 'ta';
    onLanguageChange?: (lang: 'en' | 'ta') => void;
    variant?: 'dashboard' | 'public';
    disableAutoSave?: boolean;
}

const TRANSLATIONS = {
    en: {
        report: "Precision",
        insights: "Analysis",
        desc: "High-density astronomical data computed for your specific coordinates.",
        ascendant: "Ascendant",
        moonSign: "Moon Sign",
        nakshatra: "Nakshatra",
        mainChart: "Primary Grid (D1)",
        divisionalChart: "Strength Grid (D9)",
        structural: "Hardware",
        internalStrength: "Deep Logic",
        analysis: "Analytical Output",
        periods: "Computational Timeline",
        newSearch: "New Calculation",
        store: "Archive Report",
        stored: "Archived",
        processing: "Syncing...",
        starting: "Starting",
        quickActions: "Quick Actions",
        requestExpert: "Expert Guidance",
        viewHistory: "View History"
    },
    ta: {
        report: "துல்லிய",
        insights: "ஆய்வு",
        desc: "உங்கள் இருப்பிடத்திற்காக கணக்கிடப்பட்ட உயர் அடர்த்தி வானியல் தகவல்கள்.",
        ascendant: "லக்னம்",
        moonSign: "ராசி",
        nakshatra: "நட்சத்திரம்",
        mainChart: "பிரிமரி கிரிட் (D1)",
        divisionalChart: "ஸ்ட்ரென்த் கிரிட் (D9)",
        structural: "அமைப்பு",
        internalStrength: "உள் பகுப்பாய்வு",
        analysis: "ஆய்வு முடிவுகள்",
        periods: "காலவரிசை",
        newSearch: "புதிய கணக்கீடு",
        store: "ஆவணப்படுத்து",
        stored: "ஆவணப்படுத்தப்பட்டது",
        processing: "இணைக்கப்படுகிறது...",
        starting: "தொடக்கம்",
        quickActions: "விரைவு இணைப்புகள்",
        requestExpert: "நிபுணர் ஆலோசனை",
        viewHistory: "வரலாறு"
    }
};

const LAGNA_PERSONALITIES = [
    {
        title: "The Pioneer (Aries)",
        title_ta: "மேஷ லக்னம் - முன்னோடி",
        desc: "You are born with Aries Ascendant, making you a natural leader with boundless energy. Ruled by Mars, you possess a dynamic and courageous spirit. You tackle challenges head-on and are often the first to initiate new projects. In relationships, you are passionate but may need to guard against impulsiveness. Your career path often involves leadership roles, military, sports, or entrepreneurship where independent action is valued.",
        desc_ta: "நீங்கள் மேஷ லக்னத்தில் பிறந்துள்ளீர்கள். செவ்வாய் பகவானின் ஆதிக்கத்தில் உள்ள நீங்கள் தைரியமும், சுறுசுறுப்பும் நிறைந்தவர். எதையும் முன்னின்று நடத்தும் ஆளுமை கொண்டவர். கோபத்தை குறைத்துக்கொள்வது நன்மை தரும். காவல்துறை, ராணுவம் அல்லது தனித்துவமான தொழில் உங்களுக்கு ஏற்றது."
    },
    {
        title: "The Stabilizer (Taurus)",
        title_ta: "ரிஷப லக்னம் - உறுதியானவர்",
        desc: "With Taurus Ascendant, ruled by Venus, you embody stability, beauty, and practicality. You have a calming presence and a strong appreciation for the finer things in life. You are reliable and persistent, though sometimes stubborn. Family is central to your world. Financially, you are prudent and often accumulate wealth through steady effort. You excel in fields related to finance, arts, or agriculture.",
        desc_ta: "நீங்கள் ரிஷப லக்னத்தில் பிறந்துள்ளீர்கள். சுக்கிரனின் அருளால் கவர்ச்சியான தோற்றமும், கலை ரசனையும் கொண்டவர். பொறுமையும் நிதானமும் உங்கள் பலம். பிடிவாதம் தவிர்ப்பது உறவுகளுக்கு நல்லது. கலை, வங்கி அல்லது விவசாயம் சார்ந்த துறைகள் உங்களுக்கு ஏற்றவை."
    },
    {
        title: "The Communicator (Gemini)",
        title_ta: "மிதுன லக்னம் - அறிவாளி",
        desc: "Born under Gemini Ascendant, ruled by Mercury, you are intellectually curious and quick-witted. Communication is your forte. You adapt easily to new situations but may struggle with consistency. You likely have a wide social circle and enjoy intellectual debates. Careers in media, journalism, writing, or technology suit you well due to your analytical mind.",
        desc_ta: "நீங்கள் மிதுன லக்னத்தில் பிறந்துள்ளீர்கள். புதனின் ஆதிக்கத்தால் சிறந்த புத்திசாலித்தனமும், பேச்சுத் திறனும் கொண்டவர். புதிய விஷயங்களைக் கற்றுக்கொள்வதில் ஆர்வம் அதிகம். நிலையற்ற மனதை ஒருமுகப்படுத்துவது வெற்றி தரும். எழுத்து, ஊடகம் அல்லது கணிதம் சார்ந்த துறைகள் ஏற்றவை."
    },
    {
        title: "The Nurturer (Cancer)",
        title_ta: "கடக லக்னம் - அன்பானவர்",
        desc: "As a Cancer Ascendant, ruled by the Moon, you are deeply intuitive and emotionally connected to your surroundings. You prioritize home and family above all else. You are empathetic and protective of your loved ones. However, your mood can fluctuate like the tides. You thrive in professions involving caregiving, hospitality, real estate, or psychology.",
        desc_ta: "நீங்கள் கடக லக்னத்தில் பிறந்துள்ளீர்கள். சந்திரனின் ஆதிக்கத்தால் மென்மையான மனமும், தாய்மை உணர்வும் கொண்டவர். குடும்பத்தின் மீது அதிக பாசம் கொண்டவர். அடிக்கடி மனமாற்றம் ஏற்படும் இயல்புடையவர். மருத்துவம், உணவு அல்லது ரியல் எஸ்டேட் துறைகள் உங்களுக்கு ஏற்றவை."
    },
    {
        title: "The Royal (Leo)",
        title_ta: "சிம்ம லக்னம் - ஆளுமை",
        desc: "With Leo Ascendant, ruled by the Sun, you radiate confidence and charisma. You have a natural regal air and enjoy being in the spotlight. You are generous and loyal but expect respect in return. You possess strong leadership qualities. Careers in politics, administration, entertainment, or management allow you to shine.",
        desc_ta: "நீங்கள் சிம்ம லக்னத்தில் பிறந்துள்ளீர்கள். சூரியனின் ஆதிக்கத்தால் கம்பீரமும், தலைமைப் பண்பும் கொண்டவர். தாராள குணம் உடையவர், ஆனால் கோபம் அதிகம் வரும். அரசாங்கம், அரசியல் அல்லது நிர்வாகத் துறைகளில் நீங்கள் ஜொலிப்பீர்கள்."
    },
    {
        title: "The Analyst (Virgo)",
        title_ta: "கன்னி லக்னம் - நுட்பமானவர்",
        desc: "Born with Virgo Ascendant, ruled by Mercury, you are detail-oriented, practical, and analytical. You strive for perfection in everything you do. You are service-oriented and often put others' needs before your own. Intelligence and modesty are your hallmarks. You excel in medicine, accounting, editing, or any field requiring meticulous precision.",
        desc_ta: "நீங்கள் கன்னி லக்னத்தில் பிறந்துள்ளீர்கள். புதனின் பலத்தால் கூர்மையான அறிவும், எதையும் நுணுக்கமாக ஆராயும் திறனும் கொண்டவர். சுத்தம் மற்றும் ஒழுக்கத்தை விரும்புபவர். கணக்கு, மருத்துவம் அல்லது ஆய்வுத் துறைகள் உங்களுக்கு ஏற்றவை."
    },
    {
        title: "The Diplomat (Libra)",
        title_ta: "துலாம் லக்னம் - நீதிமான்",
        desc: "Libra Ascendant, ruled by Venus, gives you a charming, balanced, and diplomatic nature. You seek harmony in relationships and surroundings. You have a strong sense of justice and fair play. Indecisiveness can be a challenge. You are suited for careers in law, diplomacy, public relations, or the arts/fashion industry.",
        desc_ta: "நீங்கள் துலாம் லக்னத்தில் பிறந்துள்ளீர்கள். சுக்கிரனின் அருளால் வசீகரமான தோற்றமும், நீதி நேர்மையும் கொண்டவர். சண்டை சச்சரவுகளை விரும்பாத அமைதியான ஸ்வாபம். சட்டம், வியாபாரம் அல்லது மக்கள் தொடர்பு துறைகள் உங்களுக்கு ஏற்றவை."
    },
    {
        title: "The Mystic (Scorpio)",
        title_ta: "விருச்சிக லக்னம் - தீர்க்கமானவர்",
        desc: "With Scorpio Ascendant, ruled by Mars, you possess an intense, magnetic, and mysterious aura. You are determined and passionate, with great emotional depth. You value privacy and loyalty. You have the ability to transform and rise from difficulties. Research, investigation, occult sciences, or surgery are fields where you can excel.",
        desc_ta: "நீங்கள் விருச்சிக லக்னத்தில் பிறந்துள்ளீர்கள். செவ்வாயின் ஆதிக்கத்தால் மன உறுதியும், எதையும் சாதிக்கும் வைராக்கியமும் கொண்டவர். ரகசியங்களை காப்பவர். ஆராய்ச்சி, மருத்துவம் அல்லது சுரங்கத் தொழில் உங்களுக்கு ஏற்றவை."
    },
    {
        title: "The Philosopher (Sagittarius)",
        title_ta: "தனுசு லக்னம் - லட்சியவாதி",
        desc: "Born under Sagittarius Ascendant, ruled by Jupiter, you are optimistic, adventurous, and philosophical. You value freedom and honest expression. You likely travel far or explore diverse cultures/knowledge. You are frank and generous. Teaching, religion, travel, or law are natural career paths for you.",
        desc_ta: "நீங்கள் தனுசு லக்னத்தில் பிறந்துள்ளீர்கள். குருவின் அருளால் நேர்மையான சிந்தனையும், உயர்ந்த லட்சியங்களும் கொண்டவர். சுதந்திரத்தை விரும்புபவர். ஆன்மீகம், கல்வி அல்லது சட்டம் சார்ந்த துறைகள் உங்களுக்கு ஏற்றவை."
    },
    {
        title: "The Builder (Capricorn)",
        title_ta: "மகர லக்னம் - உழைப்பாளி",
        desc: "Capricorn Ascendant, ruled by Saturn, makes you disciplined, ambitious, and hardworking. You are serious about your goals and value tradition. Success comes to you through patience and perseverance. You may appear reserved but have a dry wit. Corporate hierarchies, administration, construction, or banking suit your structured approach.",
        desc_ta: "நீங்கள் மகர லக்னத்தில் பிறந்துள்ளீர்கள். சனியின் ஆதிக்கத்தால் கடின உழைப்பும், விடாமுயற்சியும் கொண்டவர். கடமை தவறாதவர். நிதானமாக முன்னேறுபவர். நிர்வாகம், விவசாயம் அல்லது இரும்பு தொழில் உங்களுக்கு ஏற்றவை."
    },
    {
        title: "The Visionary (Aquarius)",
        title_ta: "கும்ப லக்னம் - மனிதாபிமானி",
        desc: "With Aquarius Ascendant, ruled by Saturn, you are innovative, humanitarian, and unconventional. You value friendship and collective growth over personal glory. You are intellectual and often ahead of your time. You may seem detached but care deeply about society. Science, technology, social work, or aviation are fields where you thrive.",
        desc_ta: "நீங்கள் கும்ப லக்னத்தில் பிறந்துள்ளீர்கள். சனியின் பலத்தால் வித்தியாசமான சிந்தனையும், உதவும் மனப்பான்மையும் கொண்டவர். தனித்துவத்தை விரும்புபவர். அறிவியல், தொழில்நுட்பம் அல்லது சமூக சேவை துறைகள் உங்களுக்கு ஏற்றவை."
    },
    {
        title: "The Dreamer (Pisces)",
        title_ta: "மீன லக்னம் - கற்பனாவாதி",
        desc: "Pisces Ascendant, ruled by Jupiter, makes you compassionate, artistic, and spiritually inclined. You are adaptable and sensitive to others' emotions. You may struggle with practical boundaries. You have a vivid imagination. Creative arts, healing professions, spirituality, or maritime careers are ideal for you.",
        desc_ta: "நீங்கள் மீன லக்னத்தில் பிறந்துள்ளீர்கள். குருவின் அருளால் இரக்க குணமும், இறைடக்தியும் கொண்டவர். கற்பனை வளம் மிக்கவர். மற்றவர் துயர் துடைப்பவர். கலை, ஆன்மீகம் அல்லது மருத்துவம் சார்ந்த துறைகள் உங்களுக்கு ஏற்றவை."
    }
];

export default function HoroscopeResult({ results, onReset, inputData, language = 'en', onLanguageChange, variant = 'dashboard', disableAutoSave = false }: HoroscopeResultProps) {
    const [user, setUser] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const t = TRANSLATIONS[language];
    const lagnaPersonality = LAGNA_PERSONALITIES[results.lagna.idx] || LAGNA_PERSONALITIES[0]; // Fallback

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        checkUser();
    }, []);

    const handleSave = async (overrideName?: string) => {
        if (!user) return;

        let name = overrideName;
        if (!name) {
            name = prompt(language === 'ta' ? "இந்த பதிவிற்கு ஒரு பெயரை உள்ளிடவும்:" : "Enter a name for this analytical record:", inputData.name || ("Report_" + new Date().getTime())) || undefined;
        }

        if (!name) return;

        setSaving(true);
        try {
            await horoscopeService.saveHoroscope({
                name,
                ...inputData,
                chart_data: results
            });
            setSaved(true);
            // setTimeout(() => setSaved(false), 3000); // Keep it saved status
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    // Auto-save effect
    useEffect(() => {
        if (!disableAutoSave && user && inputData.name && !saved && !saving) {
            handleSave(inputData.name);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, inputData.name, disableAutoSave]); // Run once when user is loaded and name exists

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-full px-6 md:px-12 space-y-8 pb-32 text-left relative"
        >

            {/* Header Info */}
            <div className="text-center space-y-6">

                <h2 className={`text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-none uppercase ${language === 'ta' ? 'font-tamil' : ''}`}>
                    {language === 'ta' ? (
                        <>
                            {inputData.name || 'பயனர்'} <span className="text-indigo-600">ஜாதகம்</span>
                        </>
                    ) : (
                        <>
                            Horoscope of <span className="text-indigo-600">{inputData.name || 'Seeker'}</span>
                        </>
                    )}
                </h2>

                {/* Big Accessible Language Switcher */}
                <div className="flex justify-center">
                    <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-2 shadow-inner">
                        <button
                            onClick={() => onLanguageChange?.('en')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${language === 'en' ? 'bg-white text-indigo-600 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => onLanguageChange?.('ta')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${language === 'ta' ? 'bg-white text-indigo-600 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            தமிழ்
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-slate-500 pt-4">
                    <span className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        {new Date(inputData.dob).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-GB')}
                    </span>
                    <span className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {inputData.tob}
                    </span>
                    <span className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200">
                        <Map className="w-3.5 h-3.5 text-indigo-500" />
                        {inputData.pob}
                    </span>
                    <button
                        onClick={() => {
                            onReset();
                        }}
                        className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline hover:text-indigo-800 ml-2"
                    >
                        {language === 'ta' ? 'திருத்து' : '(Edit Details)'}
                    </button>
                </div>
            </div>

            {/* Metric Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1200px] mx-auto">
                <MetricCard
                    icon={<Map className="w-5 h-5" />}
                    label={t.ascendant}
                    value={language === 'ta' ? results.lagna.name_ta : results.lagna.name}
                />
                <MetricCard
                    icon={<Moon className="w-5 h-5" />}
                    label={t.moonSign}
                    value={language === 'ta' ? results.moon_sign.name_ta : results.moon_sign.name}
                />
                <MetricCard
                    icon={<Star className="w-5 h-5" />}
                    label={t.nakshatra}
                    value={language === 'ta' ? NAKSHATRAS_TAMIL[results.nakshatra.idx] : results.nakshatra.name}
                />
            </div>

            {/* About User Card (Moved Here) */}
            <div className="w-full max-w-[1200px] mx-auto">
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                        <Info className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                            {language === 'ta' ? `${inputData.name || 'பயனர்'} பற்றி` : `About ${inputData.name || 'Seeker'}`}
                        </h3>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100">
                            <h4 className="text-lg font-bold text-indigo-900 mb-2">
                                {language === 'ta' ? lagnaPersonality.title_ta : lagnaPersonality.title}
                            </h4>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                {language === 'ta' ? lagnaPersonality.desc_ta : lagnaPersonality.desc}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts & AI Section Restructured */}
            <div className="space-y-12 w-full max-w-[1200px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Main Chart */}
                    <section className="space-y-6 h-full">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">{t.mainChart}</h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t.structural}</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-full max-h-[500px] flex flex-col justify-center">
                            <SouthIndianChart
                                title={language === 'ta' ? "ராசி கட்டம்" : "Rasi Chart"}
                                lagnaIdx={results.lagna.idx}
                                planets={results.planets.map(p => ({
                                    name: p.name,
                                    rasi_idx: p.rasi_idx,
                                    degrees: p.degrees
                                }))}
                                language={language}
                            />
                        </div>
                    </section>

                    {/* Navamsa Chart */}
                    {results.navamsa_chart && (
                        <section className="space-y-6 h-full">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">{t.divisionalChart}</h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t.internalStrength}</span>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-full max-h-[500px] flex flex-col justify-center">
                                <SouthIndianChart
                                    title={language === 'ta' ? "நவாம்ச கட்டம்" : "Navamsa Chart"}
                                    lagnaIdx={results.navamsa_chart.lagna.rasi_idx}
                                    planets={results.navamsa_chart.planets.map(p => ({ name: p.planet, rasi_idx: p.rasi_idx }))}
                                    language={language}
                                />
                            </div>
                        </section>
                    )}
                </div>

                {/* Dasha Timeline */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">{t.periods}</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Vimshottari Dasha</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.mahadashas
                            .filter(m => {
                                // Limit to next 20 years
                                const currentYear = new Date().getFullYear();
                                const limitYear = currentYear + 20;
                                const startYear = parseInt(m.start_date.split('-')[2]);
                                return startYear <= limitYear;
                            })
                            .map((m, i) => (
                                <MahadashaNode key={m.planet + i} m={m} language={language} />
                            ))}
                    </div>
                </div>

                {/* AI Astrologer Feature */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-8 shadow-lg text-white space-y-6 relative overflow-hidden group max-w-2xl mx-auto text-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full group-hover:bg-indigo-500/30 transition-all" />

                    <div className="flex items-center justify-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <Sparkles className="w-5 h-5 text-indigo-300" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold leading-none">AI Astrologer</h3>
                            <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest mt-1">Beta Access</p>
                        </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed relative z-10 max-w-lg mx-auto">
                        {language === 'ta'
                            ? 'உங்கள் ஜாதகம் பற்றிய கேள்விகள் உள்ளதா? எங்கள் AI ஜோதிடரிடம் கேளுங்கள்.'
                            : 'Have doubts about your chart? Ask our AI Astrologer for instant clarification and deeper insights.'}
                    </p>

                    <Link href="/chat">
                        <button
                            className="relative z-10 px-8 py-3 bg-white text-indigo-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg shadow-black/20"
                        >
                            {language === 'ta' ? 'இப்போது கேளுங்கள்' : 'Ask Now'}
                        </button>
                    </Link>
                </div>
            </div>

            <div className="pt-10 flex flex-wrap justify-center gap-4">


                {user && (
                    <button
                        onClick={() => handleSave()}
                        disabled={saving || saved}
                        className={`flex items-center gap-2 px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-md ${saved ? 'bg-indigo-900 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4 text-indigo-400" />}
                        {saving ? t.processing : saved ? t.stored : t.store}
                    </button>
                )}
            </div>
        </motion.div>
    );
}

function MahadashaNode({ m, language }: { m: Mahadasha, language: 'en' | 'ta' }) {
    const [isOpen, setIsOpen] = useState(m.is_current);
    const planetMap: Record<string, string> = {
        "Sun": "சூரியன்", "Moon": "சந்திரன்", "Mars": "செவ்வாய்",
        "Mercury": "புதன்", "Jupiter": "குரு", "Venus": "சுக்கிரன்",
        "Saturn": "சனி", "Rahu": "ராகு", "Ketu": "கேது"
    };

    const getPlanetName = (name: string) => language === 'ta' ? (planetMap[name] || name) : name;

    return (
        <div className="border border-slate-100 bg-slate-50 rounded-xl overflow-hidden transition-all">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-1.5 h-1.5 rounded-full ${m.is_current ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`} />
                    <span className={`text-xs font-bold uppercase ${m.is_current ? 'text-indigo-600' : 'text-slate-700'}`}>
                        {getPlanetName(m.planet)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{m.start_date} — {m.end_date}</span>
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4 text-slate-300" /> : <ChevronRight className="w-4 h-4 text-slate-300" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-white border-t border-slate-100 p-4 space-y-2">
                        {m.bhuktis.map(b => (
                            <div key={b.planet + b.start_date} className="flex items-center justify-between text-[11px] font-medium text-slate-500 py-1 border-b border-slate-50 last:border-0 pl-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1 h-1 rounded-full ${b.is_current ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                                    <span>{getPlanetName(b.planet)}</span>
                                </div>
                                <span>{language === 'ta' ? 'தொடக்கம்' : 'Starting'} {b.start_date}</span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MetricCard({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-3 mb-2">
                <div className="text-indigo-600 opacity-60 group-hover:opacity-100 transition-opacity">{icon}</div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
    );
}
