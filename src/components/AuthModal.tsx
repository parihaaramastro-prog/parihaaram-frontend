"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Image from "next/image";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'signup'; // Keeping props to avoid breaking consumers, but logic will be unified
    customTitle?: string;
    customDescription?: string;
}

export default function AuthModal({ isOpen, onClose, customTitle, customDescription }: AuthModalProps) {

    const supabase = createClient();
    const [showEmailLogin, setShowEmailLogin] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-md bg-white rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center space-y-4 mb-8">
                            <div className="flex justify-center mb-6">
                                <Image
                                    src="/parihaaram-logo.png"
                                    alt="Parihaaram Logo"
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    className="h-12 w-auto object-contain"
                                    style={{ width: 'auto', height: '100%' }}
                                />
                            </div>

                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                <ShieldCheck className="w-3 h-3" />
                                Secure Access
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                                {customTitle || "Welcome to Parihaaram"}
                            </h2>

                            <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
                                {customDescription || "Sign in to access your detailed astrological insights."}
                            </p>
                        </div>

                        <div className="space-y-4 sm:space-y-5">
                            {!showEmailLogin ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => supabase.auth.signInWithOAuth({
                                            provider: 'google',
                                            options: { redirectTo: `${window.location.origin}/auth/callback` },
                                        })}
                                        className="w-full h-11 sm:h-12 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 sm:gap-3 active:scale-95"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        <span>Continue with Google</span>
                                    </button>

                                    <button
                                        onClick={() => setShowEmailLogin(true)}
                                        className="w-full text-center text-[10px] text-slate-400 hover:text-indigo-600 font-bold uppercase tracking-widest transition-colors py-2"
                                    >
                                        Test Login (Email)
                                    </button>
                                </>
                            ) : (
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        setLoading(true);
                                        const { error } = await supabase.auth.signInWithPassword({ email, password });
                                        if (error) alert(error.message);
                                        else onClose();
                                        setLoading(false);
                                    }}
                                    className="space-y-4"
                                >
                                    <input
                                        type="email"
                                        placeholder="Test Email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowEmailLogin(false)}
                                            className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl"
                                        >
                                            BACK
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-[2] py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                                        >
                                            {loading ? "..." : "LOGIN"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1.5 text-emerald-600">
                                <ShieldCheck className="w-3 h-3" />
                                <span className="text-[9px] font-bold tracking-[0.2em] uppercase">256-bit SSL Encrypted</span>
                            </div>
                            <p className="text-[9px] text-slate-400 text-center max-w-xs leading-relaxed">
                                Your privacy is our priority. We do not sell your personal data.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
