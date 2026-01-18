"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

interface DivineDatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    className?: string;
}

// ... imports ...

export default function DivineDatePicker({ value, onChange, className = "" }: DivineDatePickerProps) {
    const [day, setDay] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");

    useEffect(() => {
        if (value) {
            const [y, m, d] = value.split("-");
            setYear(y);
            setMonth(m);
            setDay(d);
        }
    }, [value]);

    const updateDate = (d: string, m: string, y: string) => {
        setDay(d);
        setMonth(m);
        setYear(y);
        if (d && m && y) {
            onChange(`${y}-${m}-${d}`);
        }
    };

    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"));
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 120 }, (_, i) => (currentYear - i).toString());

    return (
        <div className={`grid grid-cols-3 gap-3 ${className}`}>
            {/* Day Select */}
            <div className="relative group">
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-900 group-hover:bg-white transition-all flex items-center justify-between">
                    <span className="truncate">{day || "Day"}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                </div>
                <select
                    value={day}
                    onChange={(e) => updateDate(e.target.value, month, year)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[16px] z-10"
                >
                    <option value="" disabled>Day</option>
                    {days.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            {/* Month Select */}
            <div className="relative group">
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-900 group-hover:bg-white transition-all flex items-center justify-between">
                    <span className="truncate">{month || "Month"}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                </div>
                <select
                    value={month}
                    onChange={(e) => updateDate(day, e.target.value, year)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[16px] z-10"
                >
                    <option value="" disabled>Month</option>
                    {months.map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>

            {/* Year Select */}
            <div className="relative group">
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-900 group-hover:bg-white transition-all flex items-center justify-between">
                    <span className="truncate">{year || "Year"}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                </div>
                <select
                    value={year}
                    onChange={(e) => updateDate(day, month, e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[16px] z-10"
                >
                    <option value="" disabled>Year</option>
                    {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
