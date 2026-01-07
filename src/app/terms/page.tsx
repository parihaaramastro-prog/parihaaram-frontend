import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="space-y-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
                        <p className="text-slate-500 font-medium text-lg">Last Updated: January 2026</p>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 space-y-10 text-slate-600 leading-relaxed">

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Parihaaram ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this Service, you shall be subject to any posted guidelines or rules applicable to such services.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900">2. Description of Service</h2>
                        <p>
                            Parihaaram provides Vedic astrology calculations, birth chart generation, and related astrological insights based on the data provided by the user. You understand and agree that the Service is provided "AS-IS" and that Parihaaram assumes no responsibility for the timeliness, deletion, mis-delivery, or failure to store any user communications or personalization settings.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900">3. User Accounts</h2>
                        <p>
                            You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900">4. Accuracy of Calculations</h2>
                        <p>
                            While we strive for the highest precision in our astronomical algorithms (Drig Ganitha/Vakya), astrology is an interpretive art. The insights provided are for guidance and entertainment purposes only. Decisions made based on this information are at your own risk.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900">5. Limitation of Liability</h2>
                        <p>
                            In no event shall Parihaaram, its officers, directors, employees, or agents, be liable to you for any direct, indirect, incidental, special, punitive, or consequential damages whatsoever resulting from any errors, mistakes, or inaccuracies of content, or any unauthorized access to our secure servers and/or any and all personal information stored therein.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-slate-100">
                        <p className="text-sm text-slate-400">
                            If you have any questions regarding these Terms of Service, please contact us at support@parihaaram.com
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
