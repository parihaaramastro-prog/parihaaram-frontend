import React from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
                        <p className="text-slate-500 font-medium text-lg">Last Updated: January 2026</p>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 space-y-10 text-slate-600 leading-relaxed">

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900">1. Information We Collect</h2>
                        <p>
                            To generate accurate birth charts, we require specific personal information, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-indigo-500">
                            <li><strong>Birth Details:</strong> Date, exact time, and place of birth.</li>
                            <li><strong>Identity Data:</strong> Name and email address (for account management).</li>
                            <li><strong>Usage Data:</strong> Information on how you interact with our services.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900">2. Strict Data Privacy & Anonymity</h2>
                        <ul className="list-disc pl-6 space-y-2 marker:text-indigo-500">
                            <li><strong>Zero Data Sale Policy:</strong> We explicitly do not sell, trade, or rent your personal identification information to others.</li>
                            <li><strong>Anonymized Consulting:</strong> When you consult with our expert astrologers or use our AI Astrologer, your identity (Name, Email) is strictly hidden. They only access your anonymized birth chart data (Time, Place, Date) required for analysis.</li>
                            <li><strong>No AI Training:</strong> Your personal data and chat history are <span className="font-bold text-slate-900">NOT</span> used to train our AI models or third-party Large Language Models (LLMs). Your data remains yours.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900">3. Data Security</h2>
                        <p>
                            We implement industry-standard security measures to protect your data. Your birth details and personal information are encrypted during transmission and storage. Access to your data is strictly limited to authorized personnel and systems required to provide the service.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900">4. Third-Party Services</h2>
                        <p>
                            We use trusted third-party services for authentication (Google OAuth via Supabase) and map data (OpenStreetMap). These providers have their own privacy policies, and we encourage you to review them.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900">5. Your Rights</h2>
                        <p>
                            You have the right to access, correct, or delete your personal data stored on our platform. You can manage your profile settings directly through the Dashboard or contact us to request full data deletion.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-slate-100">
                        <p className="text-sm text-slate-400">
                            For privacy concerns, please contact our Data Protection Officer at privacy@parihaaram.com
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
