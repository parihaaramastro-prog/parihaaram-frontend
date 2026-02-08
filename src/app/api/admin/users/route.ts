import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Admin Client to bypass RLS and manage Auth users
// function to get admin client safely
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
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        if (error) throw error;

        // Fetch all credits
        const { data: creditsData, error: creditError } = await supabaseAdmin
            .from('user_credits')
            .select('user_id, credits');

        if (creditError) throw creditError;

        const creditMap = new Map();
        creditsData?.forEach((c: any) => creditMap.set(c.user_id, c.credits));

        // Map auth users to a friendly format
        const mappedUsers = users.map(u => ({
            id: u.id,
            email: u.email || "",
            role: u.user_metadata?.role || 'customer', // Fallback to metadata
            full_name: u.user_metadata?.full_name || u.user_metadata?.name || 'User',
            created_at: u.created_at,
            last_sign_in: u.last_sign_in_at,
            provider: u.app_metadata?.provider || 'email',
            credits: creditMap.get(u.id) || 0
        }));

        return NextResponse.json({ users: mappedUsers });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { userId } = await req.json();
        console.log(`🗑️ [Admin] Deleting user: ${userId}`);

        if (!supabaseAdmin) throw new Error("MISSING_ENV: SUPABASE_SERVICE_ROLE_KEY");

        // 1. Clean up public relations first (to prevent FK restriction errors)
        try {
            // Delete credits
            const { error: creditError } = await supabaseAdmin.from('user_credits').delete().eq('user_id', userId);
            if (creditError) console.warn("Credit delete warning:", creditError);

            // Delete public profile
            const { error: profileError } = await supabaseAdmin.from('users').delete().eq('id', userId);
            if (profileError) console.warn("Profile delete warning:", profileError);

            console.log("✅ [Admin] Public records cleaned up");
        } catch (e) {
            console.warn("⚠️ Public profile delete warning:", e);
        }

        // 2. Delete from Auth - The Source of Truth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) {
            console.error("❌ Auth delete failed:", authError);
            throw authError;
        }

        console.log("✅ [Admin] Auth user deleted successfully");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("❌ Delete API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { action, userId, email } = await req.json();

        if (!supabaseAdmin) throw new Error("MISSING_ENV: SUPABASE_SERVICE_ROLE_KEY");

        if (action === 'block') {
            const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                ban_duration: "876000h" // 100 years
            });
            if (error) throw error;
            return NextResponse.json({ success: true, message: "User blocked" });
        }

        if (action === 'unblock') {
            const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                ban_duration: "none"
            });
            if (error) throw error;
            return NextResponse.json({ success: true, message: "User unblocked" });
        }

        if (action === 'reset_password') {
            const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";
            const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                password: tempPassword
            });
            if (error) throw error;
            return NextResponse.json({ success: true, tempPassword });
        }

        if (action === 'magic_link') {
            const { data, error } = await supabaseAdmin.auth.admin.generateLink({
                type: 'magiclink',
                email: email
            });
            if (error) throw error;
            return NextResponse.json({ success: true, link: data.properties.action_link });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
