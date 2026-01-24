import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient(); // Use service_role client for admin access if needed, but here we assume this route is protected by middleware/RBAC

    // 1. Total Users
    // Note: 'auth.users' is not directly queryable via client lib without service role usually.
    // For now, assuming we might track user profiles in a public table or use an RPC.
    // IF you don't have a 'profiles' table mirroring users, we can't easily count total users without service_role key.
    // Let's assume we count unique user_ids from 'horoscopes' + 'chat_sessions' as a proxy for "Active Users" if profiles table doesn't exist,
    // OR ideally we use the service role client here if available.
    // For this implementation, I'll attempt a direct count if RLS allows, or gracefully fallback.
    // A better metric for now: "Users with Saved Charts" (High Intent Users)

    // We'll execute a raw SQL query or use multiple simpler queries

    // Metric 1: Total Reports Generated (Proxy for Product Usage)
    const { count: totalReports } = await supabase
        .from('horoscopes')
        .select('*', { count: 'exact', head: true });

    // Metric 2: AI Engagement (Chats)
    const { count: totalChats } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true });

    // Metric 3: Total Compatibility Checks (Vibe Checks)
    // Assuming we store these? If not, we start tracking them. 
    // For now, let's substitute with Total Messages sent (Stickiness)
    const { count: totalMessages } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true });

    // Metric 4: Recent Growth (This Week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { count: newReportsLast7Days } = await supabase
        .from('horoscopes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());

    // Metric 5: Daily Activity for Chart
    // Get aggregated data for the last 30 days
    // This usually requires a stored procedure or complex grouping, 
    // but for MVP we can just fetch the 'created_at' of records and reduce in JS (if data volume is low < 10k)
    // or better, use an RPC. Let's start with a fetch-and-reduce for MVP as it's easiest to deploy without migration.

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentReports } = await supabase
        .from('horoscopes')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

    // Group by date
    const activityMap: Record<string, number> = {};
    recentReports?.forEach((r: { created_at: string }) => {
        const date = new Date(r.created_at).toISOString().split('T')[0];
        activityMap[date] = (activityMap[date] || 0) + 1;
    });

    const chartData = Object.entries(activityMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
        overview: {
            total_users_proxy: 'N/A', // Needs admin access to auth.users
            total_reports: totalReports || 0,
            active_chats: totalChats || 0,
            total_messages: totalMessages || 0,
            growth_rate: newReportsLast7Days || 0
        },
        chart: chartData
    });
}
