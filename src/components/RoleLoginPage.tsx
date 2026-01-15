"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { profileService, UserRole } from "@/lib/services/profile";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, Loader2, Compass } from "lucide-react";
import { useRouter } from "next/navigation";

import Link from "next/link";

interface LoginPageProps {
    role: UserRole;
    title: string;
    description: string;
    redirectPath: string;
}

export default function GenericLoginPage({ role, title, description, redirectPath }: LoginPageProps) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();
        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // Verify role
            const profile = await profileService.getProfile();
            if (!profile || profile.role !== role) {
                await supabase.auth.signOut();
                throw new Error(`Unauthorized. This portal is for ${role}s only.`);
            }

            router.push(redirectPath);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-4"
                    >
                        <Shield className="w-8 h-8" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">{title}</h1>
                    <p className="text-slate-500 text-sm font-medium">{description}</p>
                </div>

                <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Identity (Email)</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-medium focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                                    placeholder="name@agency.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Security Code</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-medium focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wide text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Identity"}
                    </button>

                    <div className="pt-4 text-center">
                        <Link href="/" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
                            Return to Public Surface
                        </Link>
                    </div>
                </form>

                <div className="text-center opacity-30">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">SECURE ACCESS PROTOCOL 4.2.0</p>
                </div>
            </div>
        </main>
    );
}
