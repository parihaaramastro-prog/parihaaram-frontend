"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Compass, Sparkles, History, User, Bot,
    Briefcase, ShieldCheck, Users, LogOut, Menu, X, BookOpen
} from "lucide-react";
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from "@/lib/supabase";
import UserProfileDropdown from "./UserProfileDropdown";
import AuthModal from "./AuthModal";
import { horoscopeService } from "@/lib/services/horoscope";
import { settingsService } from "@/lib/services/settings";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isConsultationEnabled, setIsConsultationEnabled] = useState(true);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        settingsService.getSettings().then(s => setIsConsultationEnabled(s.consultation_enabled ?? true));

        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.warn("Auth session error:", error.message);
                return;
            }
            setUser(session?.user ?? null);
            if (session?.user) {
                // Pre-fetch profiles into cache
                horoscopeService.getSavedHoroscopes().catch(() => { });

                import("@/lib/services/profile").then(({ profileService }) => {
                    profileService.getProfile().then(p => setRole(p?.role || 'customer')).catch(() => { });
                });
            }
        }).catch(err => {
            console.warn("Failed to check initial session (network or config issue):", err);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                // Pre-fetch profiles into cache
                horoscopeService.getSavedHoroscopes().catch(console.error);

                import("@/lib/services/profile").then(({ profileService }) => {
                    profileService.getProfile().then(p => setRole(p?.role || 'customer'));
                });
            } else {
                setRole(null);
                horoscopeService.clearCache();
            }
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        // Instant UI feedback
        setUser(null);
        setRole(null);
        horoscopeService.clearCache();

        try {
            const supabase = createClient();
            await supabase.auth.signOut();
        } catch (e) {
            console.warn("Logout error:", e);
        } finally {
            router.push("/");
            router.refresh(); // Ensure middleware re-checks for next navigation
        }
    };

    const navLinks = {
        guest: [
            { id: 'home', label: 'Home', icon: Compass, href: '/' },
            { id: 'features', label: 'Features', icon: Sparkles, href: '#features' },
            { id: 'blog', label: 'Blog', icon: BookOpen, href: '/blog' },
            { id: 'trust', label: 'Trust', icon: ShieldCheck, href: '#trust' },
        ],
        admin: [
            { id: 'ops', label: 'Operations Hub', icon: ShieldCheck, href: '/admin/dashboard' },
        ],
        astrologer: [
            { id: 'jobs', label: 'Job Dashboard', icon: Briefcase, href: '/astrologer/dashboard' },
        ],
        customer: [
            { id: 'dashboard', label: 'Dashboard', icon: Compass, href: '/dashboard' },
            ...(isConsultationEnabled ? [
                { id: 'expertise', label: 'Consult', icon: Sparkles, href: '/consultation' },
                { id: 'history', label: 'Readings', icon: History, href: '/consultation/history' },
            ] : []),
            { id: 'chat', label: 'AI Astrologer', icon: Bot, href: '/chat' },
        ],
    };

    const currentLinks = !user ? navLinks.guest : role === 'admin' ? navLinks.admin : role === 'astrologer' ? navLinks.astrologer : navLinks.customer;

    // Hide navbar ONLY on astrologer and admin pages (Show on chat now)
    if (pathname?.startsWith('/astrologer') || pathname?.startsWith('/admin')) {
        return null;
    }

    // Special "Slim Mode" for Chat Page to maximize screen real estate
    const isChatPage = pathname?.startsWith('/chat');

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${isChatPage ? 'py-0' : isScrolled ? 'py-2 md:py-4' : 'py-4 md:py-8'}`}>
            <div className={`mx-auto transition-all duration-500 ${isChatPage ? 'w-full px-0' : 'max-w-[1400px] px-4 md:px-6'}`}>
                <div className={`relative flex items-center justify-between transition-all duration-700 
                    ${isChatPage
                        ? 'h-14 px-4 border-b bg-white/80 backdrop-blur-md border-slate-200/50 rounded-none shadow-sm'
                        : `px-4 md:px-8 h-18 rounded-2xl md:rounded-[2rem] border ${isScrolled ? 'bg-slate-50/90 backdrop-blur-2xl border-indigo-200/50 shadow-2xl shadow-indigo-500/10' : 'bg-slate-50/70 backdrop-blur-xl border-white/40 shadow-lg shadow-indigo-500/5'}`
                    }`}>

                    {/* Brand */}
                    <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
                        <div className="relative h-10 md:h-12 w-auto min-w-[2.5rem] flex items-center justify-center">
                            <Image
                                src="/parihaaram-logo.png"
                                alt="Parihaaram Logo"
                                width={0}
                                height={0}
                                sizes="100vw"
                                className="h-full w-auto object-contain transform group-hover:scale-110 transition-transform duration-500"
                                style={{ width: 'auto', height: '100%' }}
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 leading-none">Parihaaram</span>
                        </div>
                    </Link>

                    {/* Navigation - Centered Absolutely (Desktop) */}
                    <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 p-1.5 bg-slate-100/50 backdrop-blur-md rounded-2xl border border-slate-200/40">
                        {currentLinks.map((link) => (
                            <Link
                                key={link.id}
                                href={link.href}
                                className="group relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl transition-all duration-500 hover:bg-white hover:shadow-sm"
                            >
                                <link.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">
                                    {link.label}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Profile & Auth & Mobile Menu */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {user ? (
                            <UserProfileDropdown user={user} />
                        ) : (
                            <button
                                onClick={() => setIsAuthOpen(true)}
                                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-full transition-all duration-300 shadow-lg shadow-indigo-500/10 active:scale-95"
                            >
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Login</span>
                                <User className="w-3 h-3 md:w-3 md:h-3" />
                            </button>
                        )}

                        {/* Mobile Menu Toggle */}
                        {/* Mobile Menu Toggle - HIDDEN AS PER USER REQUEST */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="absolute top-full left-4 right-4 mt-2 p-4 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col gap-2 z-50 lg:hidden"
                        >
                            {currentLinks.map((link) => (
                                <Link
                                    key={link.id}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <link.icon className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-slate-700">{link.label}</span>
                                </Link>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </nav>
    );
}
