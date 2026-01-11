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
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) throw error;

        // Map auth users to a friendly format
        const mappedUsers = users.map(u => ({
            id: u.id,
            email: u.email || "",
            role: u.user_metadata?.role || 'customer', // Fallback to metadata
            full_name: u.user_metadata?.full_name || u.user_metadata?.name || 'User',
            created_at: u.created_at,
            last_sign_in: u.last_sign_in_at,
            provider: u.app_metadata?.provider || 'email'
        }));

        return NextResponse.json({ users: mappedUsers });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!supabaseAdmin) throw new Error("MISSING_ENV: SUPABASE_SERVICE_ROLE_KEY");

        // 1. Delete from Auth (this usually cascades if set up, but let's be sure)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) throw authError;

        // 2. Delete from public.users (if no cascade)
        // We use try-catch here because if foreign key fails or user doesn't exist, it's fine if auth is gone
        try {
            await supabaseAdmin
                .from('users')
                .delete()
                .eq('id', userId);
        } catch (e) {
            console.warn("Public profile delete failed (might not exist):", e);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
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
