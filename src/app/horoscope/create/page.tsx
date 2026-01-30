"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import HoroscopeForm from "@/components/HoroscopeForm";
import { horoscopeService } from "@/lib/services/horoscope";
import { createClient } from "@/lib/supabase";

export default function CreateHoroscopePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleCreate = async (data: any) => {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Should probably redirect to login, but for now specific flow
                alert("Please log in to create a profile");
                return;
            }

            // Save to DB
            await horoscopeService.saveHoroscope({
                name: data.name,
                gender: data.gender,
                dob: data.dob,
                tob: data.tob,
                pob: data.pob,
                lat: data.lat,
                lon: data.lon,
            });

            // Redirect back to chat with action to open selector
            router.push('/chat?action=select_profile');
        } catch (error) {
            console.error("Failed to create profile:", error);
            alert("Failed to create profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <Link
                    href="/chat"
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Chat
                </Link>

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create New Profile</h1>
                    <p className="text-slate-500 font-medium">Enter birth details to generate a new chart</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-indigo-500/5 overflow-hidden">
                    <HoroscopeForm
                        onCalculate={handleCreate}
                        loading={loading}
                        language="en"
                    />
                </div>
            </div>
        </main>
    );
}
