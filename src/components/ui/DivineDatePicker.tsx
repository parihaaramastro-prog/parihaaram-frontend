"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

interface DivineDatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    className?: string;
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function DivineDatePicker({ value, onChange, className = "" }: DivineDatePickerProps) {
    const [day, setDay] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");

    // Initialize from value prop
    useEffect(() => {
        if (value) {
            const [y, m, d] = value.split("-");
            setYear(y);
            setMonth(m); // "01" to "12"
            setDay(d);
        }
    }, [value]);

    // Update parent when parts change
    const updateDate = (d: string, m: string, y: string) => {
        setDay(d);
        setMonth(m);
        setYear(y);

        if (d && m && y) {
            onChange(`${y}-${m}-${d}`);
        }
    };

    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"));
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 120 }, (_, i) => (currentYear - i).toString());

    return (
        <div className={`grid grid-cols-3 gap-3 ${className}`}>
            {/* Day Select */}
            <div className="relative group">
                <select
                    value={day}
                    onChange={(e) => updateDate(e.target.value, month, year)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all cursor-pointer hover:bg-white"
                >
                    <option value="" disabled>Day</option>
                    {days.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-indigo-600 transition-colors" />
            </div>

            {/* Month Select */}
            <div className="relative group">
                <select
                    value={month}
                    onChange={(e) => updateDate(day, e.target.value, year)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all cursor-pointer hover:bg-white"
                >
                    <option value="" disabled>Month</option>
                    {MONTHS.map((m, i) => (
                        <option key={m} value={(i + 1).toString().padStart(2, "0")}>{m}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-indigo-600 transition-colors" />
            </div>

            {/* Year Select */}
            <div className="relative group">
                <select
                    value={year}
                    onChange={(e) => updateDate(day, month, e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all cursor-pointer hover:bg-white"
                >
                    <option value="" disabled>Year</option>
                    {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-indigo-600 transition-colors" />
            </div>
        </div>
    );
}
