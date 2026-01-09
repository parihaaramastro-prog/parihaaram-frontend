"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Sparkles, Loader2, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'signup';
    customTitle?: string;
    customDescription?: string;
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login', customTitle, customDescription }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(initialMode === 'login');

    // Reset state when modal opens/closes or initialMode changes
    useEffect(() => {
        // If initialMode ('login' or 'signup') is provided, respect it. 
        // Note: The prop name in functionality was `initialMode` but in the interface it is `initialMode`.
        // However, the caller passed `defaultView="signup"`. The interface needs `initialMode` or I should change the prop name.
        // Wait, looking at the previous file content (lines 10-18):
        // interface AuthModalProps { ... initialMode?: 'login' | 'signup'; ... }
        // The calling code used `defaultView="signup"`. I need to start by adding `defaultView` to props or changing the caller.
        // I will CHANG THE CALLER in the previous file (AIAstrologerLanding) to use `initialMode` instead of `defaultView` 
        // BUT I can't edit that file in this step easily without another tool call. 
        // Actually, I can just update the interface here to accept `defaultView` as an alias or just rename `initialMode`.
        // Let's stick to `initialMode`.

        setIsLogin(initialMode === 'login');
    }, [initialMode, isOpen]);

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showEmailForm, setShowEmailForm] = useState(false);
    const router = useRouter();

    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                        data: {
                            full_name: name,
                        },
                    },
                });
                if (error) throw error;

                if (!data.session) {
                    setError("Account created. Please check your email to verify your identity.");
                    setLoading(false);
                    return;
                }
            }

            onClose();
            router.push('/dashboard'); // Redirect to dashboard after auth
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
                                    className="h-24 w-auto object-contain"
                                    style={{ width: 'auto', height: '100%' }}
                                />
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                <ShieldCheck className="w-3 h-3" />
                                {isLogin ? "Secure Login" : "Private & Secure Registration"}
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                                {customTitle || (isLogin ? "Welcome Back" : "Begin Your Journey")}
                            </h2>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
                                {customDescription || (isLogin
                                    ? "Access your saved charts and encrypted personal readings."
                                    : "Create a secure profile to store your birth details. Your data is encrypted and never shared.")}
                            </p>
                        </div>

                        <div className="space-y-4 sm:space-y-5">
                            {/* Google Sign-In Button */}
                            <button
                                type="button"
                                onClick={() => supabase.auth.signInWithOAuth({
                                    provider: 'google',
                                    options: {
                                        redirectTo: `${window.location.origin}/auth/callback`,
                                    },
                                })}
                                className="w-full h-11 sm:h-12 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 sm:gap-3 active:scale-95"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </button>

                            {/* Divider with Toggle */}
                            <div className="relative my-4 sm:my-5">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmailForm(!showEmailForm)}
                                        className="bg-white px-4 text-slate-400 font-bold tracking-widest hover:text-indigo-600 transition-colors"
                                    >
                                        {showEmailForm ? "Hide Email Options" : "Or continue with Email"}
                                    </button>
                                </div>
                            </div>

                            {/* Email/Password Form - Collapsible */}
                            <AnimatePresence>
                                {showEmailForm && (
                                    <motion.form
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        onSubmit={handleAuth}
                                        className="space-y-5 overflow-hidden"
                                    >
                                        {!isLogin && (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                                                        <User className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        placeholder="John Doe"
                                                        className="divine-input !pl-12 !h-12"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                                                    <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                                </div>
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="you@example.com"
                                                    className="divine-input !pl-12 !h-12"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                                                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                                </div>
                                                <input
                                                    type="password"
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="divine-input !pl-12 !h-12"
                                                />
                                            </div>
                                        </div>

                                        {error && (
                                            <p className="text-red-500 text-[11px] font-bold text-center bg-red-50 py-2 rounded-lg border border-red-100">
                                                {error}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center gap-3"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <span>{isLogin ? "Sign In" : "Create Account"}</span>
                                            )}
                                        </button>

                                        <p className="text-center text-xs font-medium text-slate-500">
                                            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                                            <button
                                                type="button"
                                                onClick={() => setIsLogin(!isLogin)}
                                                className="text-indigo-600 font-bold hover:underline"
                                            >
                                                {isLogin ? "Sign Up" : "Log In"}
                                            </button>
                                        </p>
                                    </motion.form>
                                )}
                            </AnimatePresence>
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
