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

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("❌ Missing specific environment variables in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixAndCreate() {
    // 1. Generate Random 6-Digit ID
    const randomId = Math.floor(100000 + Math.random() * 900000).toString();
    const email = `admin${randomId}@parihaaram.admin`;
    const password = 'ParihaaramAdmin@2025';

    console.log(`\n🛠 Debugging & Creating New Admin...`);
    console.log(`Target ID: ${randomId}`);
    console.log(`Target Email: ${email}`);

    // 2. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: 'Parihaaram System Admin' }
    });

    if (authError) {
        console.error("❌ Auth Creation Failed:", authError.message);
        return;
    }

    const userId = authData.user.id;
    console.log(`✅ Auth User Created (UUID: ${userId})`);

    // 3. Force Access to Public Users Table
    // We wait a moment for any triggers to fire (if any), then strictly UPDATE/UPSERT
    await new Promise(r => setTimeout(r, 1000));

    const { data: existingPublic, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    console.log(`\n🔍 Public Table Status for New User:`);
    if (existingPublic) {
        console.log(`   - Row exists? YES`);
        console.log(`   - Current Role: ${existingPublic.role}`);
    } else {
        console.log(`   - Row exists? NO (Trigger didn't run or failed)`);
    }

    // 4. Force Update Role
    const { error: upsertError } = await supabase
        .from('users')
        .upsert({
            id: userId,
            email: email,
            role: 'admin', // <--- CRITICAL
            full_name: 'Parihaaram System Admin'
        });

    if (upsertError) {
        console.error("❌ Link to Public Table Failed:", upsertError.message);
    } else {
        console.log("✅ Role FORCED to 'admin' in public table.");
    }

    console.log("\n---------------------------------------------------");
    console.log("🎉 NEW ADMIN CREDENTIALS");
    console.log("---------------------------------------------------");
    console.log(`Login URL: /admin/login`);
    console.log(`ID:        ${randomId}`);
    console.log(`Password:  ${password}`);
    console.log("---------------------------------------------------");
    console.log("👉 Please copy these details now. They are unique.");
}

fixAndCreate();
