import { createClient } from "@/lib/supabase";

export type UserRole = 'customer' | 'astrologer' | 'admin';

export interface User {
    id: string;
    role: UserRole;
    full_name: string | null;
    email: string;
    birth_date?: string | null;
    birth_time?: string | null;
    birth_place?: string | null;
    gender?: string | null;
}

export const profileService = {
    async getProfile() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data as User | null;
    },

    async ensureProfile(role: UserRole = 'customer') {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!existingUser) {
            const { data: newUser, error } = await supabase
                .from('users')
                .insert({
                    id: user.id,
                    role: role,
                    full_name: user.user_metadata?.full_name || 'Seeker',
                    email: user.email
                })
                .select()
                .single();

            if (error) {
                // If duplicate key error (race condition), fetch and return the existing user
                if (error.code === '23505') {
                    const { data: retryUser } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    return retryUser as User;
                }
                throw error;
            }
            return newUser as User;
        }

        return existingUser as User;
    },

    async getAstrologers() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'astrologer');

        if (error) throw error;
        return data as User[];
    },

    async getUserByEmail(email: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data as User | null;
    },

    async updateRole(userId: string, role: UserRole) {
        const supabase = createClient();
        const { error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', userId);

        if (error) throw error;
    },

    async updateProfile(userId: string, updates: Partial<any>) {
        const supabase = createClient();
        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;
    },

    async getAllUsers() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as User[];
    }
};
