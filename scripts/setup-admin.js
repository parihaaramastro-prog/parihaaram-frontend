const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Load Environment Variables from .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.+)`));
    return match ? match[1].trim() : null;
};

const SUPABASE_URL = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_SERVICE_KEY = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("❌ Missing specific environment variables in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- CONFIGURATION ---
const ADMIN_ID = process.argv[2] || '999999'; // Default ID
const ADMIN_PASSWORD = process.argv[3] || 'ParihaaramAdmin@2025'; // Default Password
const INTERNAL_EMAIL = `admin${ADMIN_ID}@parihaaram.admin`;

async function setupAdmin() {
    console.log(`\n🚀 Setting up Admin User...`);
    console.log(`ID: ${ADMIN_ID}`);
    console.log(`Internal Email: ${INTERNAL_EMAIL}`);

    // 1. Create User (or Sign In if exists)
    // We use admin.createUser to auto-confirm email bypassing verification
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email: INTERNAL_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: 'Super Admin' }
    });

    if (createError) {
        console.error("⚠️ Error creating user:", createError.message);
        // If user already exists, try to get ID to update role
        if (createError.message.includes('User already registered')) {
            console.log("ℹ️ User exists. Attempting to fetch UUID to update role...");
            // We can't fetch user by email easily without listUsers permission which service role has
            const { data: users } = await supabase.auth.admin.listUsers();
            const existing = users.users.find(u => u.email === INTERNAL_EMAIL);
            if (existing) {
                await updateRole(existing.id);
            } else {
                console.error("Could not find the existing user.");
            }
        }
    } else {
        console.log("✅ User created successfully directly via Admin API (Auto-verified).");
        await updateRole(userData.user.id);
    }
}

async function updateRole(userId) {
    console.log(`\n🔄 Promoting User ${userId} to ADMIN role...`);

    // 1. Update public 'users' table (managed by profile service)
    const { error: publicError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId);

    if (publicError) {
        // If row doesn't exist (maybe trigger didn't run?), insert it
        console.warn("⚠️ Update failed, trying insert...", publicError.message);
        const { error: insertError } = await supabase
            .from('users')
            .upsert({
                id: userId,
                role: 'admin',
                email: INTERNAL_EMAIL,
                full_name: 'Super Admin'
            });

        if (insertError) {
            console.error("❌ Failed to set role in public table:", insertError.message);
            return;
        }
    }

    console.log("✅ Role updated to 'admin' successfully!");
    console.log("\n---------------------------------------------------");
    console.log("🎉 ADMIN SETUP COMPLETE");
    console.log("---------------------------------------------------");
    console.log(`Login URL: /admin/login`);
    console.log(`Secure ID: ${ADMIN_ID}`);
    console.log(`Password:  ${ADMIN_PASSWORD}`);
    console.log("---------------------------------------------------");
}

setupAdmin();
