import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Admin Client to bypass RLS
const getSupabaseAdmin = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        return null;
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};

const supabaseAdmin = getSupabaseAdmin();

export async function GET(req: NextRequest) {
    try {
        if (!supabaseAdmin) throw new Error("MISSING_ENV: SUPABASE_SERVICE_ROLE_KEY");

        // Fetch all horoscopes without the join first (safest fallback if FK is missing)
        const { data: horoscopes, error } = await supabaseAdmin
            .from('horoscopes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch user details manually
        // We fetch from BOTH public.users (for profile names) AND auth.users (for secure emails)
        const userIds = Array.from(new Set(horoscopes.map(h => h.user_id))).filter(Boolean);
        let userMap: Record<string, any> = {};

        // 1. Try fetching from public profiles
        if (userIds.length > 0) {
            const { data: publicUsers } = await supabaseAdmin
                .from('users')
                .select('id, email, full_name')
                .in('id', userIds);

            if (publicUsers) {
                publicUsers.forEach(u => userMap[u.id] = { ...u });
            }
        }

        // 2. Fetch reliable Auth Data (Source of Truth for Emails)
        // We fetch a page of users. If you have >1000 users, this needs pagination logic.
        const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
            perPage: 1000
        });

        if (!authError && authUsers) {
            authUsers.forEach(au => {
                if (userMap[au.id]) {
                    // Update email from auth to be sure
                    userMap[au.id].email = au.email;
                } else {
                    // unexpected: user exists in auth but not public? Add them.
                    userMap[au.id] = {
                        id: au.id,
                        email: au.email,
                        full_name: au.user_metadata?.full_name || au.user_metadata?.name || 'Guest'
                    };
                }
            });
        }

        // Merge data
        const merged = horoscopes.map(h => ({
            ...h,
            users: userMap[h.user_id] || { email: 'Deleted User', full_name: 'Unknown' }
        }));

        return NextResponse.json({ horoscopes: merged });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
