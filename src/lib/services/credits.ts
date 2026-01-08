import { createClient } from "@/lib/supabase";

export interface UserCredits {
    user_id: string;
    credits: number;
    updated_at: string;
}

export const creditService = {
    async getCredits() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 0;

        const { data, error } = await supabase
            .from('user_credits')
            .select('credits')
            .eq('user_id', user.id)
            .single();

        if (error && error.code === 'PGRST116') {
            // Row not found, create one with default (trial) credits
            const { data: newData, error: createError } = await supabase
                .from('user_credits')
                .insert({ user_id: user.id, credits: 3 }) // Give 3 free messages
                .select()
                .single();

            if (createError) {
                console.error("Error creating credit record:", createError);
                return 0;
            }
            return newData.credits;
        }

        if (error) {
            console.error("Error fetching credits:", error);
            return 0;
        }

        return data.credits;
    },

    async checkAndDeductCredit(userId: string): Promise<boolean> {
        // This should primarily be done server-side, but client-side check helps UI
        // We will implement the server-side logic in the API route
        const supabase = createClient();
        const { data, error } = await supabase.rpc('deduct_credit', { user_id_param: userId });

        if (error) {
            console.error("Credit deduction failed:", error);
            return false;
        }
        return data; // Returns true if successful, false if insufficient funds (defined in SQL function)
    },

    async topUpCredits(amount: number): Promise<boolean> {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        // Get current credits first to add to balance
        const currentCredits = await this.getCredits();
        const newBalance = currentCredits + amount;

        // Use upsert to handle both insert (if missing) and update
        const { error } = await supabase
            .from('user_credits')
            .upsert({ user_id: user.id, credits: newBalance })
            .select();

        if (error) {
            console.error("Top-up failed:", error);
            return false;
        }

        return true;
    }
};
