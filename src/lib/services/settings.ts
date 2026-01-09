
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
        // Use UPDATE instead of UPSERT to avoid trying to write to the 'id' column
        // This avoids the "cannot insert a non-DEFAULT value" error for Identity columns.
        const { error } = await supabase
            .from('app_settings')
            .update(settings)
            .eq('id', 1);

        if (error) throw error;
    }
};
