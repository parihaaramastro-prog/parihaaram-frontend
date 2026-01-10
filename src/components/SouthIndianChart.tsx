"use client";

import { motion } from "framer-motion";
import { RASHIS_LIST } from "@/lib/astrology";

interface ChartPlanet {
    name: string;
    rasi_idx: number;
    degrees?: number;
}

interface SouthIndianChartProps {
    title: string;
    tamilTitle?: string;
    planets: ChartPlanet[];
    lagnaIdx: number;
    language?: 'en' | 'ta';
}

// Order of rashis for South Indian Chart
const RASHIS_LAYOUT = [
    11, 0, 1, 2,   // Row 1
    10, -1, -1, 3,  // Row 2
    9, -1, -1, 4,   // Row 3
    8, 7, 6, 5      // Row 4
];

const PLANET_SHORT_NAMES_EN: Record<string, string> = {
    "Sun": "Su",
    "Moon": "Mo",
    "Mars": "Ma",
    "Mercury": "Me",
    "Jupiter": "Ju",
    "Venus": "Ve",
    "Saturn": "Sa",
    "Rahu": "Ra",
    "Ketu": "Ke",
};

const PLANET_SHORT_NAMES_TA: Record<string, string> = {
    "Sun": "சூ",
    "Moon": "சந்",
    "Mars": "செ",
    "Mercury": "பு",
    "Jupiter": "கு",
    "Venus": "சு",
    "Saturn": "ச",
    "Rahu": "ரா",
    "Ketu": "கே",
};

export default function SouthIndianChart({ title, planets, lagnaIdx, language = 'en' }: SouthIndianChartProps) {
    const houseContents: Record<number, { name: string; degrees?: number; isLagna?: boolean }[]> = {};
    const isTa = language === 'ta';
    const namesMap = isTa ? PLANET_SHORT_NAMES_TA : PLANET_SHORT_NAMES_EN;

    // Add Lagna
    if (!houseContents[lagnaIdx]) houseContents[lagnaIdx] = [];
    houseContents[lagnaIdx].push({ name: isTa ? "லக்" : "ASC", isLagna: true });

    // Add Planets
    planets.forEach(p => {
        if (!houseContents[p.rasi_idx]) houseContents[p.rasi_idx] = [];
        houseContents[p.rasi_idx].push({
            name: namesMap[p.name] || p.name,
            degrees: p.degrees
        });
    });

    return (
        <div className="w-full max-w-[500px] aspect-square mx-auto grid grid-cols-4 grid-rows-4 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {RASHIS_LAYOUT.map((rasiIdx, gridIndex) => {
                const isMiddle = rasiIdx === -1;

                if (isMiddle) {
                    if (gridIndex === 5) {
                        return (
                            <div key={gridIndex} className="col-span-2 row-span-2 flex items-center justify-center p-6 bg-slate-50 border border-slate-100">
                                <div className="text-center space-y-2">
                                    <span className={`text-xl md:text-2xl font-bold tracking-tight text-slate-900 uppercase ${isTa ? 'font-tamil' : ''}`}>{title}</span>
                                    <div className="h-1 w-8 bg-indigo-600 mx-auto rounded-full" />
                                </div>
                            </div>
                        );
                    }
                    return null;
                }

                const planetsInHouse = houseContents[rasiIdx] || [];
                const rasiInfo = RASHIS_LIST[rasiIdx];

                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: gridIndex * 0.02 }}
                        key={gridIndex}
                        className="border border-slate-100 p-3 flex flex-col items-center justify-start min-h-[60px] hover:bg-slate-50 transition-all relative"
                    >
                        <span className="text-[10px] text-slate-300 font-bold absolute top-1 right-2">
                            {rasiIdx + 1}
                        </span>
                        <span className={`text-[9px] text-slate-400 font-bold uppercase mb-2 tracking-wide truncate w-full text-center ${isTa ? 'font-tamil' : ''}`}>
                            {isTa ? rasiInfo.ta : rasiInfo.en}
                        </span>
                        <div className="flex flex-wrap items-center justify-center gap-1.5 w-full">
                            {planetsInHouse.map((p, i) => (
                                <span key={i} className={`text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${p.isLagna ? 'bg-indigo-900 text-white' : 'text-slate-900 bg-slate-100'}`}>
                                    {p.name}
                                    {p.degrees !== undefined && !p.isLagna && (
                                        <sup className="text-[7px] opacity-70 font-medium">{Math.floor(p.degrees)}°</sup>
                                    )}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
