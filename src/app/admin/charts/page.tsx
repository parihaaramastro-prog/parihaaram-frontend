"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Loader2, ArrowLeft, Star, Calendar, MapPin,
    User, ChevronRight, Activity, Clock, Box, Eye, LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SouthIndianChart from "@/components/SouthIndianChart";

// Helper for chart calculation
const getSignIndex = (name: string | undefined): number => {
    if (!name) return -1;
    const n = name.toLowerCase().trim();
    if (n.includes('aries') || n.includes('mesha')) return 0;
    if (n.includes('taurus') || n.includes('vrish')) return 1;
    if (n.includes('gemini') || n.includes('mith')) return 2;
    if (n.includes('cancer') || n.includes('karka')) return 3;
    if (n.includes('leo') || n.includes('simha')) return 4;
    if (n.includes('virgo') || n.includes('kanya')) return 5;
    if (n.includes('libra') || n.includes('tula')) return 6;
    if (n.includes('scorpio') || n.includes('vrishchi')) return 7;
    if (n.includes('sagitt') || n.includes('dhanu')) return 8;
    if (n.includes('capri') || n.includes('makara')) return 9;
    if (n.includes('aquar') || n.includes('kumbha')) return 10;
    if (n.includes('pisces') || n.includes('meena')) return 11;
    return -1;
};

interface Chart {
    id: string;
    user_id: string;
    name: string;
    dob: string;
    tob: string;
    pob: string;
    lat: number;
    lon: number;
    gender: string;
    created_at: string;
    users?: {
        email: string;
        full_name: string;
    };
    chart_data?: any;
}

export default function AdminChartsPage() {
    const router = useRouter();
    const [charts, setCharts] = useState<Chart[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
    const [chartDetails, setChartDetails] = useState<Chart | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [chartLanguage, setChartLanguage] = useState<'en' | 'ta'>('en');

    // Initial Fetch
    useEffect(() => {
        const fetchCharts = async () => {
            try {
                const res = await fetch('/api/admin/charts');
                const data = await res.json();
                if (data.horoscopes) {
                    setCharts(data.horoscopes);
                    // Auto-select the first chart to fill the view
                    if (data.horoscopes.length > 0 && !selectedChartId) {
                        setSelectedChartId(data.horoscopes[0].id);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch charts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCharts();
    }, []);

    // Fetch Details when selected
    useEffect(() => {
        if (!selectedChartId) {
            setChartDetails(null);
            return;
        }

        const fetchDetails = async () => {
            setLoadingDetails(true);
            try {
                const res = await fetch(`/api/admin/charts/${selectedChartId}`);
                const data = await res.json();
                if (data.chart) {
                    setChartDetails(data.chart);
                }
            } catch (error) {
                console.error("Failed to load chart details", error);
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchDetails();
    }, [selectedChartId]);

    const filteredCharts = charts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.users?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.pob.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden overscroll-none">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/admin/dashboard" className="p-2 -ml-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="w-px h-6 bg-slate-200" />
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-600 rounded-lg shadow-sm shadow-indigo-200">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-widest leading-none">Global Chart Registry</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Records</span>
                        <span className="text-base font-bold text-slate-900 leading-none">{charts.length}</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar List */}
                <div className={`w-full md:w-96 bg-white border-r border-slate-200 flex flex-col z-10 ${selectedChartId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                placeholder="Search user, name, city..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-700 placeholder:text-slate-400 uppercase tracking-wide focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
                        ) : filteredCharts.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-400 font-medium">No charts found matching your query.</div>
                        ) : (
                            filteredCharts.map(chart => (
                                <button
                                    key={chart.id}
                                    onClick={() => setSelectedChartId(chart.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all group ${selectedChartId === chart.id
                                        ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-100'
                                        : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`font-bold text-sm ${selectedChartId === chart.id ? 'text-indigo-700' : 'text-slate-900'}`}>{chart.name}</h3>
                                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono font-medium">{chart.gender}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <User className="w-3 h-3" />
                                            <span className="truncate max-w-[180px]">{chart.users?.email || 'Guest User'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <MapPin className="w-3 h-3" />
                                            <span className="truncate">{chart.pob}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 pt-2 border-t border-dashed border-slate-200 group-hover:border-indigo-200/50">
                                            <Calendar className="w-3 h-3" />
                                            <span>{chart.dob} at {chart.tob}</span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className={`flex-1 bg-slate-50/50 overflow-y-auto ${!selectedChartId ? 'hidden md:flex' : 'flex'} flex-col`}>
                    {selectedChartId ? (
                        <div className="flex-1 flex flex-col h-full">
                            {/* Toolbar */}
                            <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setSelectedChartId(null)} className="md:hidden p-1.5 -ml-1.5 hover:bg-slate-100 rounded-lg">
                                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                                    </button>
                                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                                        {chartDetails ? `Chart Inspector: ${chartDetails.name}` : 'Loading...'}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline-block">ID: {selectedChartId}</span>
                                </div>
                            </div>

                            {/* Content */}
                            {loadingDetails || !chartDetails ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Crunching Numbers...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 max-w-5xl mx-auto w-full space-y-6 pb-20">
                                    {/* Warnings if data is missing */}
                                    {!chartDetails.chart_data && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
                                            <Activity className="w-5 h-5 shrink-0" />
                                            <div>
                                                <h3 className="text-sm font-bold">Calculation Unavailable</h3>
                                                <p className="text-xs mt-1">Could not compute planetary positions. The Astro Engine might be offline or the birth data format is invalid.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Top Grid: Profile & Langa */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                                        {/* Chart Visualization - MOVED HERE */}
                                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center relative">
                                            {/* Language Toggle */}
                                            <div className="absolute top-4 right-4 z-10 flex bg-slate-100 rounded-lg p-1">
                                                <button
                                                    onClick={() => setChartLanguage('en')}
                                                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${chartLanguage === 'en' ? 'bg-white shadow text-slate-900 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    ENG
                                                </button>
                                                <button
                                                    onClick={() => setChartLanguage('ta')}
                                                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${chartLanguage === 'ta' ? 'bg-white shadow text-slate-900 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    தமிழ்
                                                </button>
                                            </div>

                                            {chartDetails.chart_data ? (
                                                <SouthIndianChart
                                                    title={chartLanguage === 'ta' ? "ராசி சக்கரம்" : "Rasi Chart"}
                                                    planets={chartDetails.chart_data.planets.map((p: any) => ({
                                                        name: p.name,
                                                        rasi_idx: getSignIndex(p.sign || p.rashi || p.sign_name),
                                                        degrees: p.degrees
                                                    }))}
                                                    lagnaIdx={getSignIndex(chartDetails.chart_data.lagna?.name)}
                                                    language={chartLanguage}
                                                />
                                            ) : (
                                                <div className="w-full aspect-square flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 text-xs font-bold uppercase">
                                                    Chart Visual Unavailable
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            {/* Profile Card */}
                                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <User className="w-4 h-4" /> Personal Data
                                                </h3>
                                                <div className="space-y-3">
                                                    <InfoRow label="Full Name" value={chartDetails.name} />
                                                    <InfoRow label="Account Email" value={chartDetails.users?.email} />
                                                    <InfoRow label="Birth Date" value={chartDetails.dob} />
                                                    <InfoRow label="Birth Time" value={chartDetails.tob} />
                                                    <InfoRow label="Place" value={chartDetails.pob} />
                                                </div>
                                            </div>

                                            {/* Key Astrological Points */}
                                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <Star className="w-4 h-4 text-amber-500" /> Core Placements
                                                </h3>
                                                {chartDetails.chart_data ? (
                                                    <div className="space-y-3">
                                                        <InfoRow label="Lagna (Ascendant)" value={chartDetails.chart_data.lagna?.name} highlight />
                                                        <InfoRow label="Moon Sign (Rasi)" value={chartDetails.chart_data.moon_sign?.name} />
                                                        <InfoRow label="Nakshatra" value={chartDetails.chart_data.nakshatra?.name} />
                                                        <InfoRow label="Yogi Point" value={chartDetails.chart_data.yogi_point?.name ?? '—'} />
                                                        <InfoRow label="Avayogi" value={chartDetails.chart_data.avayogi_point?.name ?? '—'} />
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-500 italic">Data unavailable</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Planetary Table */}
                                    {chartDetails.chart_data && (
                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                                    <LayoutGrid className="w-4 h-4" /> Planetary Schema
                                                </h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Planet</th>
                                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sign</th>
                                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Degrees</th>
                                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">House (Calc)</th>
                                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nakshatra</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {chartDetails.chart_data.planets?.map((p: any, idx: number) => (
                                                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                                                <td className="px-6 py-3 text-xs font-bold text-slate-900">{p.name}</td>
                                                                <td className="px-6 py-3 text-xs font-medium text-slate-600">{p.sign_name || p.rashi || p.sign}</td>
                                                                <td className="px-6 py-3 text-xs font-mono text-slate-500">{typeof p.degrees === 'number' ? p.degrees.toFixed(2) : p.degrees}°</td>
                                                                <td className="px-6 py-3 text-xs font-bold text-indigo-600">
                                                                    {p.house ? `House ${p.house}` : calculateHouse(chartDetails.chart_data, p.sign_name)}
                                                                </td>
                                                                <td className="px-6 py-3 text-xs text-slate-500">{p.nakshatra}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dasha / Bhukti Timeline */}
                                    {chartDetails.chart_data?.mahadashas && (
                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                                    <Clock className="w-4 h-4" /> Vimshottari Data (Dasha / Bhukti)
                                                </h3>
                                            </div>
                                            <div className="divide-y divide-slate-100">
                                                {chartDetails.chart_data.mahadashas.map((md: any, idx: number) => (
                                                    <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className={`text-sm font-bold uppercase tracking-wide flex items-center gap-2 ${md.is_current ? 'text-indigo-600' : 'text-slate-800'}`}>
                                                                {md.planet} Mahadasha
                                                                {md.is_current && <span className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-200">ACTIVE</span>}
                                                            </span>
                                                            <span className="text-xs font-mono text-slate-400">
                                                                {md.start_date} — {md.end_date}
                                                            </span>
                                                        </div>
                                                        {/* Bhuktise - Only show for current or if expanded (simple version: show all) */}
                                                        <div className="pl-4 border-l-2 border-slate-100 mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                                                            {md.bhuktis?.map((bk: any, bIdx: number) => (
                                                                <div key={bIdx} className={`text-[10px] p-2 rounded border ${bk.is_current ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                                                    <div className="font-bold">{bk.planet} Bhukti</div>
                                                                    <div className="mt-0.5 opacity-70">{bk.end_date}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Raw JSON Toggle */}
                                    <details className="group pt-10">
                                        <summary className="cursor-pointer text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest list-none flex items-center gap-2 select-none">
                                            <Box className="w-4 h-4" /> Debug: View Raw JSON
                                        </summary>
                                        <div className="mt-4 bg-slate-900 rounded-xl p-6 overflow-x-auto">
                                            <pre className="text-[10px] font-mono text-emerald-400">
                                                {JSON.stringify(chartDetails.chart_data, null, 2)}
                                            </pre>
                                        </div>
                                    </details>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-8 text-center">
                            <LayoutGrid className="w-16 h-16 mb-4 opacity-50" />
                            <h3 className="text-base font-bold text-slate-400 uppercase tracking-widest">No Chart Selected</h3>
                            <p className="text-xs mt-2 max-w-md mx-auto">Select a user profile from the sidebar to inspect their complete astrological data, including planetary positions and dasha timelines.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value, highlight = false }: { label: string, value?: string, highlight?: boolean }) {
    return (
        <div className="flex justify-between items-center py-1 border-b border-dashed border-slate-100 last:border-0">
            <span className="text-xs text-slate-400 font-medium">{label}</span>
            <span className={`text-sm font-bold ${highlight ? 'text-indigo-600' : 'text-slate-800'}`}>
                {value || '—'}
            </span>
        </div>
    );
}

// Client-side helper (replicated for immediate feedback)
const calculateHouse = (chartData: any, planetSignName: string) => {
    if (!chartData?.lagna?.name || !planetSignName) return "-";
    const signs = [
        "aries", "taurus", "gemini", "cancer", "leo", "virgo",
        "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
    ];

    const clean = (s: string) => {
        s = s.toLowerCase();
        if (s.includes('aries') || s.includes('mesha')) return 'aries';
        if (s.includes('taurus') || s.includes('vrish')) return 'taurus';
        if (s.includes('gemini') || s.includes('mith')) return 'gemini';
        if (s.includes('cancer') || s.includes('karka')) return 'cancer';
        if (s.includes('leo') || s.includes('simh')) return 'leo';
        if (s.includes('virgo') || s.includes('kanya')) return 'virgo';
        if (s.includes('libra') || s.includes('tula')) return 'libra';
        if (s.includes('scorpio') || s.includes('vrish')) return 'scorpio';
        if (s.includes('sagitt') || s.includes('dhanu')) return 'sagittarius';
        if (s.includes('capri') || s.includes('makar')) return 'capricorn';
        if (s.includes('aquar') || s.includes('kumbha')) return 'aquarius';
        if (s.includes('pisc') || s.includes('meena')) return 'pisces';
        return s;
    };

    const lagnaIdx = signs.indexOf(clean(chartData.lagna.name));
    const planetIdx = signs.indexOf(clean(planetSignName));

    if (lagnaIdx === -1 || planetIdx === -1) return "-";

    const house = ((planetIdx - lagnaIdx + 12) % 12) + 1;
    return `House ${house}`;
};
