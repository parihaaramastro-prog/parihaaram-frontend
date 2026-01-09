"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

interface DivineTimePickerProps {
    value: string; // HH:mm (24h format)
    onChange: (time: string) => void;
    className?: string;
}

export default function DivineTimePicker({ value, onChange, className = "" }: DivineTimePickerProps) {
    const [hour, setHour] = useState("12");
    const [minute, setMinute] = useState("00");
    const [period, setPeriod] = useState("AM");

    // Initialize from value prop (HH:mm)
    useEffect(() => {
        if (value) {
            const [h, m] = value.split(":");
            let hourInt = parseInt(h);
            const periodVal = hourInt >= 12 ? "PM" : "AM";

            if (hourInt > 12) hourInt -= 12;
            if (hourInt === 0) hourInt = 12;

            setHour(hourInt.toString().padStart(2, "0"));
            setMinute(m);
            setPeriod(periodVal);
        }
    }, [value]);

    // Update parent when parts change
    const updateTime = (h: string, m: string, p: string) => {
        setHour(h);
        setMinute(m);
        setPeriod(p);

        if (h && m && p) {
            let hourInt = parseInt(h);
            if (p === "PM" && hourInt < 12) hourInt += 12;
            if (p === "AM" && hourInt === 12) hourInt = 0;

            const timeString = `${hourInt.toString().padStart(2, "0")}:${m}`;
            onChange(timeString);
        }
    };

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

    return (
        <div className={`grid grid-cols-3 gap-3 ${className}`}>
            {/* Hour Select */}
            <div className="relative group">
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-900 group-hover:bg-white transition-all flex items-center justify-between">
                    <span className="truncate">{hour}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                </div>
                <select
                    value={hour}
                    onChange={(e) => updateTime(e.target.value, minute, period)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[16px] z-10"
                >
                    {hours.map((h) => (
                        <option key={h} value={h}>{h}</option>
                    ))}
                </select>
            </div>

            {/* Minute Select */}
            <div className="relative group">
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-900 group-hover:bg-white transition-all flex items-center justify-between">
                    <span className="truncate">{minute}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                </div>
                <select
                    value={minute}
                    onChange={(e) => updateTime(hour, e.target.value, period)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[16px] z-10"
                >
                    {minutes.map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>

            {/* AM/PM Select */}
            <div className="relative group">
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-900 group-hover:bg-white transition-all flex items-center justify-between">
                    <span className="truncate">{period}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                </div>
                <select
                    value={period}
                    onChange={(e) => updateTime(hour, minute, e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[16px] z-10"
                >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </select>
            </div>
        </div>
    );
}
