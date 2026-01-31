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

// Helper: Calculate Chart Data on the fly if missing (Duplicated from chat/route.ts for isolation)
async function calculateChartData(dob: string, tob: string, lat: number, lon: number) {
    try {
        const [year, month, day] = dob.split("-").map(Number);
        const [hour, minute] = tob.split(":").map(Number);

        const inputAsUtcMs = Date.UTC(year, month - 1, day, hour, minute);
        const istOffsetMs = 5.5 * 60 * 60 * 1000;
        const trueUtcMs = inputAsUtcMs - istOffsetMs;
        const utcDate = new Date(trueUtcMs);

        const payload = {
            year: utcDate.getUTCFullYear(),
            month: utcDate.getUTCMonth() + 1,
            day: utcDate.getUTCDate(),
            hour: utcDate.getUTCHours(),
            minute: utcDate.getUTCMinutes(),
            lat: lat,
            lon: lon
        };

        const apiUrl = process.env.ASTRO_API_URL || "http://127.0.0.1:8000";
        // console.log(`[Admin API] Connecting to Astro Engine at: ${apiUrl}`);

        const apiResponse = await fetch(`${apiUrl}/calculate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!apiResponse.ok) {
            console.error(`[Admin API] Astro Engine Error: ${apiResponse.status}`);
            return null;
        }
        return await apiResponse.json();
    } catch (e) {
        console.error("On-the-fly calculation failed:", e);
        return null;
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!supabaseAdmin) throw new Error("Config Error");
        const { id } = await params;

        const { data: chart, error } = await supabaseAdmin
            .from('horoscopes')
            .select(`*`)
            .eq('id', id)
            .single();

        if (error || !chart) {
            return NextResponse.json({ error: "Chart not found" }, { status: 404 });
        }

        // Fetch User details manually
        if (chart.user_id) {
            // 1. Try Public Profile
            const { data: userData } = await supabaseAdmin
                .from('users')
                .select('email, full_name')
                .eq('id', chart.user_id)
                .single();

            let finalUser = userData || { email: '', full_name: 'Unknown' };

            // 2. Try Auth (Source of Truth)
            try {
                const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.getUserById(chart.user_id);
                if (authUser && !authError) {
                    finalUser.email = authUser.email || finalUser.email;
                    if (!finalUser.full_name || finalUser.full_name === 'Unknown') {
                        finalUser.full_name = authUser.user_metadata?.full_name || 'Guest User';
                    }
                }
            } catch (e) {
                // Ignore auth fetch errors
            }

            (chart as any).users = finalUser;
        }

        // If chart_data is missing, calculate it now
        if (!chart.chart_data) {
            const calcData = await calculateChartData(chart.dob, chart.tob, chart.lat, chart.lon);
            if (calcData) {
                chart.chart_data = calcData;
                // Optional: Update DB to cache it for next time
                await supabaseAdmin.from('horoscopes').update({ chart_data: calcData }).eq('id', id);
            }
        }

        return NextResponse.json({ chart });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
