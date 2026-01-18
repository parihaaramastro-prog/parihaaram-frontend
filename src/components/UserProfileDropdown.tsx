"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Settings, ChevronDown, Mail, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { creditService } from "@/lib/services/credits";

interface UserProfileDropdownProps {
    user: any;
}

export default function UserProfileDropdown({ user }: UserProfileDropdownProps) {


    const [isOpen, setIsOpen] = useState(false);
    const [credits, setCredits] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const supabase = createClient();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            creditService.getCredits().then(setCredits);
        }
    }, [isOpen]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const getInitials = (name: string) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
    const email = user?.email || "";

    // Robust Avatar Check
    const avatarUrl = user?.user_metadata?.avatar_url ||
        user?.user_metadata?.picture ||
        user?.identities?.[0]?.identity_data?.avatar_url ||
        user?.identities?.[0]?.identity_data?.picture;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-full bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
            >
                {/* Avatar */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-inner overflow-hidden relative border border-slate-200">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        getInitials(displayName)
                    )}
                </div>

                {/* Name - Hidden on mobile */}
                <span className="hidden sm:block text-sm font-bold text-slate-700 max-w-[120px] truncate">
                    {displayName}
                </span>

                {/* Chevron */}
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50"
                    >
                        {/* User Info Header */}
                        <div className="p-4 bg-gradient-to-br from-indigo-50 to-slate-50 border-b border-slate-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden border border-white">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        getInitials(displayName)
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                                    <p className="text-xs text-slate-500 truncate">{email}</p>
                                </div>
                            </div>

                            {/* Account Status Badge */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                                    <Shield className="w-3 h-3 text-emerald-600" />
                                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Verified</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full">
                                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">{credits ?? '-'} Credits</span>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push('/dashboard');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group"
                            >
                                <User className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                <div>
                                    <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600">My Dashboard</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">View your charts</p>
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push('/dashboard/settings');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group"
                            >
                                <Settings className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                <div>
                                    <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600">Account Settings</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Manage preferences</p>
                                </div>
                            </button>

                            <div className="my-2 border-t border-slate-100" />

                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left group"
                            >
                                <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                                <div>
                                    <p className="text-sm font-bold text-slate-700 group-hover:text-red-600">Sign Out</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">End session</p>
                                </div>
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                            <p className="text-[9px] text-slate-400 text-center uppercase tracking-widest">
                                Secure Session • End-to-End Encrypted
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
