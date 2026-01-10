"use client";

import { useState } from "react";
import HoroscopeResult from "@/components/HoroscopeResult";
import { AstrologyResults } from "@/lib/astrology";

export default function ManualEntryPage() {
    const [formData, setFormData] = useState({
        name: "Test User",
        dob: "",
        tob: "",
        lat: 13.0827, // Default Chennai
        lon: 80.2707, // Default Chennai
    });
    const [results, setResults] = useState<AstrologyResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [lang, setLang] = useState<'en' | 'ta'>('en');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'lat' || name === 'lon' ? parseFloat(value) : value
        }));
    };

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("/api/astrology", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dob: formData.dob,
                    tob: formData.tob,
                    lat: formData.lat,
                    lon: formData.lon
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to calculate birth chart");
            }

            const result = await response.json();
            setResults(result);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen p-6 bg-slate-50">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-slate-900">Manual Entry Test</h1>

                {!results ? (
                    <form onSubmit={handleCalculate} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Time of Birth</label>
                                <input
                                    type="time"
                                    name="tob"
                                    value={formData.tob}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Latitude (Decimal)</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="lat"
                                    value={formData.lat}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Longitude (Decimal)</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="lon"
                                    value={formData.lon}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                        >
                            {loading ? "Calculating..." : "Calculate Position"}
                        </button>
                    </form>
                ) : (
                    <div>
                        <button
                            onClick={() => setResults(null)}
                            className="mb-6 text-sm font-bold text-indigo-600 hover:underline"
                        >
                            ← Back to Manual Entry
                        </button>
                        <HoroscopeResult
                            results={results}
                            onReset={() => setResults(null)}
                            inputData={{ ...formData, pob: "Manual Coordinates" }}
                            language={lang}
                            onLanguageChange={setLang}
                            variant="dashboard"
                            disableAutoSave={true}
                        />
                    </div>
                )}
            </div>
        </main>
    );
}
