
import { createClient } from "@/lib/supabase";

export interface AppSettings {
    razorpay_enabled: boolean;
    pack_price: number;
    pack_credits: number;
    ai_model?: string;
    system_prompt?: string;
    is_prompt_active?: boolean;
    prompt_presets?: any[];
    master_prompt?: string; // Master prompt to set the tone for all AI interactions
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
                pack_credits: 5,
                ai_model: 'gpt-4o',
                system_prompt: "",
                is_prompt_active: true
            };
        }

        return data as AppSettings;
    },

    async updateSettings(settings: Partial<AppSettings>): Promise<void> {
        const supabase = createClient();

        // 1. Try to find an existing row
        const { data: existing, error: fetchError } = await supabase
            .from('app_settings')
            .select('id')
            .limit(1)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (existing) {
            // Update the found row
            const { error } = await supabase
                .from('app_settings')
                .update(settings)
                .eq('id', existing.id);
            if (error) throw error;
        } else {
            // No row exists, insert a new one
            const { error } = await supabase
                .from('app_settings')
                .insert([settings]);
            if (error) throw error;
        }
    }
};
