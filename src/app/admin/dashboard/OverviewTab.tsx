"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
    Activity, ArrowUpRight, MessageSquare, Users,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";

export default function OverviewTab() {
    const [metrics, setMetrics] = useState<any>(null);
    const [stats, setStats] = useState({ total: 0, pending: 0, complete: 0 });

    const fetchMetrics = async () => {
        try {
            const statsRes = await fetch('/api/admin/stats');
            if (!statsRes.ok) throw new Error("Failed to fetch stats");
            const statsData = await statsRes.json();
            setMetrics(statsData);
        } catch (error) {
            console.error("Error fetching stats:", error);
            // Fallback so UI renders even if stats fail
            setMetrics({
                overview: { total_reports: 0, active_chats: 0, total_messages: 0, growth_rate: 0 },
                chart: []
            });
        }
    };

    // Real-time Subscription to Horoscopes Table
    useEffect(() => {
        fetchMetrics();

        const supabase = createClient();
        const channel = supabase
            .channel('admin-overview')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'horoscopes' },
                () => {
                    fetchMetrics(); // Refresh stats on any change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (!metrics) return <div className="p-10 text-center text-slate-400">Loading live data...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
        >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-50 rounded-lg"><Activity className="w-5 h-5 text-indigo-600" /></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Reports</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{metrics.overview.total_reports}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 rounded-lg"><MessageSquare className="w-5 h-5 text-emerald-600" /></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Chats</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{metrics.overview.active_chats}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-50 rounded-lg"><Users className="w-5 h-5 text-amber-600" /></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Messages</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{metrics.overview.total_messages}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-50 rounded-lg"><ArrowUpRight className="w-5 h-5 text-purple-600" /></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Growth (7d)</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">+{metrics.overview.growth_rate}</p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-8">Report Generation Velocity (30 Days)</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={metrics.chart}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* PostHog / Analytics Embed */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4 text-orange-600" />
                        PostHog Analytics
                    </h3>
                    <a
                        href="https://us.posthog.com/project/settings"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-widest"
                    >
                        Configure Dashboard
                    </a>
                </div>
                {/* 
                    NOTE: To display a PostHog Dashboard here:
                    1. Go to PostHog -> Dashboards -> Share -> Copy "Embedded" link.
                    2. Replace the src below OR store it in an environment variable e.g. NEXT_PUBLIC_POSTHOG_EMBED_URL
                */}
                <iframe
                    src={process.env.NEXT_PUBLIC_POSTHOG_EMBED_URL || "https://us.posthog.com/shared/dashboard/default"}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen
                    className="flex-1 bg-slate-50"
                />
            </div>
        </motion.div>
    );
}
