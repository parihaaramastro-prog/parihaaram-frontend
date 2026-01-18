"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { profileService, UserRole } from "@/lib/services/profile";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, Loader2 } from "lucide-react";
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
    const [adminId, setAdminId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();
        try {
            // Construct internal email from 6-digit ID
            const internalEmail = `admin${adminId}@parihaaram.admin`;

            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: internalEmail,
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
        <main className="fixed inset-0 w-screen h-screen overflow-hidden bg-slate-50 selection:bg-indigo-100/50 overscroll-none flex items-center justify-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>

            {/* Subtle Gradient Spot */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Scrollable Content Container */}
            <div className="w-full h-full overflow-y-auto overflow-x-hidden flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-md flex flex-col py-10">
                    <div className="mb-8 text-center space-y-3">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-800 mb-2"
                        >
                            <Shield className="w-8 h-8" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
                        <p className="text-slate-500 text-base font-medium leading-relaxed max-w-xs mx-auto">{description}</p>
                    </div>

                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <form onSubmit={handleLogin} className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/50 shadow-xl shadow-slate-200/50 space-y-8">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Secure ID (6-Digit)</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            inputMode="numeric"
                                            maxLength={6}
                                            pattern="\d{6}"
                                            className="w-full h-12 bg-slate-50/50 border border-slate-200 rounded-xl pl-12 pr-4 text-base font-medium focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder:text-slate-400 font-mono tracking-widest"
                                            placeholder="000000"
                                            value={adminId}
                                            onChange={(e) => setAdminId(e.target.value.replace(/\D/g, ''))}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Passkey</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                                        <input
                                            type="password"
                                            required
                                            className="w-full h-12 bg-slate-50/50 border border-slate-200 rounded-xl pl-12 pr-4 text-base font-medium focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder:text-slate-400"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="p-4 rounded-xl bg-red-50/50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wide text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold uppercase tracking-[0.15em] transition-all shadow-lg hover:shadow-xl hover:shadow-slate-900/10 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Identity"}
                            </button>

                            <div className="pt-2 text-center">
                                <Link href="/" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                                    Return to Public Surface
                                </Link>
                            </div>
                        </form>
                    </motion.div>

                    <div className="text-center mt-8 opacity-30">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">SECURE CHECKPOINT</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
