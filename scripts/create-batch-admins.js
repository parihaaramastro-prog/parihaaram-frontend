const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Load Environment Variables
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.+)`));
    return match ? match[1].trim() : null;
};

const SUPABASE_URL = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_SERVICE_KEY = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const COMMON_PASSWORD = 'ParihaaramAdmin@2025';

async function createAdmin(id) {
    const internalEmail = `admin${id}@parihaaram.admin`;
    console.log(`Creating Admin ID: ${id}...`);

    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email: internalEmail,
        password: COMMON_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: `Admin ${id}` }
    });

    if (createError) {
        if (createError.message.includes('User already registered')) {
            console.log(`  User ${id} already exists. promoting...`);
            // Fetch existing user to get ID (service role requirement usually, but we can try blindly updating if we had the ID, but we don't know the UUID of the email easily without listUsers)
            // For batch script simplicity, we'll skip existing or try to find them if needed. 
            // Let's try to find their UUID
            const { data: users } = await supabase.auth.admin.listUsers();
            const existing = users.users.find(u => u.email === internalEmail);
            if (existing) {
                await updateRole(existing.id, id);
                return { id, password: COMMON_PASSWORD, status: 'Updated' };
            }
        } else {
            console.error(`  Failed to create ${id}:`, createError.message);
            return null;
        }
    } else {
        await updateRole(userData.user.id, id);
        return { id, password: COMMON_PASSWORD, status: 'Created' };
    }
}

async function updateRole(userId, displayId) {
    const { error: publicError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId);

    if (publicError) {
        // Upsert if missing
        await supabase.from('users').upsert({
            id: userId,
            role: 'admin',
            email: `admin${displayId}@parihaaram.admin`,
            full_name: `Admin ${displayId}`
        });
    }
}

async function generateBatch() {
    console.log("🚀 Generating 6 Unique Admin IDs...");

    const ids = [];
    while (ids.length < 6) {
        const id = Math.floor(100000 + Math.random() * 900000).toString();
        // Ensure strictly unique
        if (!ids.includes(id) && id !== '999999') {
            ids.push(id);
        }
    }

    const results = [];
    for (const id of ids) {
        const res = await createAdmin(id);
        if (res) results.push(res);
    }

    console.log("\n✅ BATCH CREATION COMPLETE");
    console.log("-------------------------------------------------------");
    console.log("|  Admin ID  |       Password        | Status |");
    console.log("-------------------------------------------------------");
    results.forEach(r => {
        console.log(`|   ${r.id}   | ${r.password} | ${r.status}  |`);
    });
    console.log("-------------------------------------------------------");
    console.log(`Login URL: /admin/login`);
}

generateBatch();
