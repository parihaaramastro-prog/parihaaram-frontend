
import { createClient } from "@/lib/supabase";

export interface AppSettings {
    razorpay_enabled: boolean;
    pack_price: number;
    pack_credits: number;
}

export const settingsService = {
    // We will use a dedicated table 'app_settings' or assume a row in a config table.
    // Since we don't have migrations, we'll try to use a 'system_settings' table if explicit.
    // Fallback: We can misuse a public metadata table or assume the user created 'app_settings'.
    // Given the constraints and user request for "reflect across all users", DB is the only way.
    // I will try to read/write to a 'app_settings' table. I'll include SQL instructions.

    async getSettings(): Promise<AppSettings> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('app_settings')
            .select('*')
            .single();

        if (error) {
            console.warn("Could not fetch settings (using defaults):", error.message);
            // Default fallback
            return {
                razorpay_enabled: false,
                pack_price: 99,
                pack_credits: 5
            };
        }

        return data as AppSettings;
    },

    async updateSettings(settings: Partial<AppSettings>): Promise<void> {
        const supabase = createClient();
        // Upsert logic. We assume ID 1 for the singleton settings row.
        const { error } = await supabase
            .from('app_settings')
            .upsert({ id: 1, ...settings }); // Assuming 'id' is the primary key and value is 1

        if (error) throw error;
    }
};
