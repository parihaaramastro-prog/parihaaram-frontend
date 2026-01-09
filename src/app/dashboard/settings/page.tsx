"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, AlertTriangle, Loader2, CheckCircle2, Crown, Bell, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function AccountSettings() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState("");

    // Notifications State (Mock)
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [marketingNotifs, setMarketingNotifs] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/');
                return;
            }

            setUser(user);
            setFullName(user.user_metadata?.full_name || "");
            setLoading(false);
        };
        fetchUser();
    }, [router]);

    const handleUpdateProfile = async () => {
        if (!user) return;
        setSaving(true);
        const supabase = createClient();

        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            if (error) throw error;
            alert("Profile updated successfully!");
        } catch (error: any) {
            alert("Error updating profile: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 pt-32 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tighter">Account Settings</h1>
                    <p className="text-slate-500 font-medium">Manage your personal information and preferences.</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl shadow-inner">
                            {fullName ? fullName[0] : user.email[0].toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{fullName || "User"}</h2>
                            <p className="text-sm font-medium text-slate-400">{user.email}</p>
                        </div>
                        <div className="ml-auto">
                            <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                <Shield className="w-3 h-3" /> Verified
                            </span>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Personal Info */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                                <User className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Personal Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            value={user.email}
                                            disabled
                                            className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 pl-10 pr-3 text-sm font-medium text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                    Save Changes
                                </button>
                            </div>
                        </section>



                        {/* Preferences */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                                <Bell className="w-5 h-5 text-slate-400" />
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Notifications</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Transaction Emails</p>
                                        <p className="text-xs text-slate-500">Receive invoices and payment confirmations.</p>
                                    </div>
                                    <Switch checked={emailNotifs} onChange={setEmailNotifs} />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Marketing & Updates</p>
                                        <p className="text-xs text-slate-500">Receive news about new features and offers.</p>
                                    </div>
                                    <Switch checked={marketingNotifs} onChange={setMarketingNotifs} />
                                </div>
                            </div>
                        </section>

                        {/* Security */}
                        <section className="space-y-6 opacity-60 pointer-events-none grayscale">
                            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                                <Lock className="w-5 h-5 text-slate-400" />
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Security (Coming Soon)</h3>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                                <p className="text-sm text-slate-400 font-medium">Password changes and 2FA are managed via secure magic links currently.</p>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </main>
    );
}

function Switch({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
    );
}
