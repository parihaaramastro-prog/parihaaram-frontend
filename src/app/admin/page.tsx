"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Check, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminPage() {
    const [enabled, setEnabled] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('razorpay_enabled');
        setEnabled(stored === 'true');
    }, []);

    const toggleRazorpay = () => {
        const newState = !enabled;
        setEnabled(newState);
        localStorage.setItem('razorpay_enabled', String(newState));
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden"
            >
                <div className="bg-slate-900 p-6 flex items-center gap-4">
                    <Link href="/chat" className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex items-center gap-2 text-white font-bold text-xl">
                        <ShieldAlert className="w-6 h-6 text-amber-500" />
                        Admin Panel
                    </div>
                </div>

                <div className="p-8">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                            <h3 className="font-bold text-slate-900">Razorpay Integration</h3>
                            <p className="text-sm text-slate-500">Enable real payments gateway</p>
                        </div>

                        <button
                            onClick={toggleRazorpay}
                            className={`relative w-14 h-8 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${enabled ? 'bg-green-500' : 'bg-slate-300'
                                }`}
                        >
                            <span
                                className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow transition-transform duration-200 ease-in-out flex items-center justify-center ${enabled ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                            >
                                {enabled && <Check className="w-3 h-3 text-green-600" />}
                            </span>
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 text-amber-800 text-sm rounded-xl border border-amber-100">
                        <strong>Note:</strong> When disabled, the Pay button in the chat will simulate a successful payment instantly (Mock Mode).
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
