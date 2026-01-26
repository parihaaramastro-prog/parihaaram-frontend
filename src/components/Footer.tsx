"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, Mail, Instagram, Linkedin, ShieldCheck, Phone } from "lucide-react";

// X Icon (Custom SVG)
const XIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
                    {/* Brand Column */}
                    <div className="md:col-span-1 space-y-4">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative h-10 w-10 flex items-center justify-center">
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
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-800">
                                Parihaaram
                            </span>
                        </Link>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Advanced Vedic astrology powered by proprietary algorithms and AI. Precision predictions for modern life.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Platform</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/" className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/chat" className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    AI Astrologer
                                </Link>
                            </li>
                            <li>
                                <Link href="/predictions" className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    Predictions
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/astrologer/login" className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-indigo-300" />
                                    Astrologer Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Legal</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/privacy" className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Connect</h3>
                        <ul className="space-y-4">
                            <li>
                                <a href="mailto:parihaaramastro@gmail.com" className="group flex items-center gap-3 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    parihaaramastro@gmail.com
                                </a>
                            </li>

                            <li className="flex gap-2">
                                <a href="#" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:border-black hover:bg-black/5 hover:text-black transition-all">
                                    <XIcon className="w-3.5 h-3.5" />
                                </a>
                                <a href="#" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 transition-all">
                                    <Instagram className="w-4 h-4" />
                                </a>
                                <a href="#" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all">
                                    <Linkedin className="w-4 h-4" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-400 font-medium">
                        &copy; {currentYear} Parihaaram. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3" />
                        Secure & Private
                    </div>
                </div>
            </div>
        </footer>
    );
}
