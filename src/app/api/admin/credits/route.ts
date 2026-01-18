
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Admin Client
const getSupabaseAdmin = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) return null;

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};

const supabaseAdmin = getSupabaseAdmin();

export async function POST(req: NextRequest) {
    try {
        if (!supabaseAdmin) throw new Error("Server configuration error");

        const { userId, credits } = await req.json();

        if (!userId || typeof credits !== 'number') {
            return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('user_credits')
            .upsert({ user_id: userId, credits: credits, updated_at: new Date().toISOString() });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
