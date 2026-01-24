import { createClient } from "@/lib/supabase";

export interface SavedHoroscope {
    id: string;
    name: string;
    gender: string;
    dob: string;
    tob: string;
    pob: string;
    lat: number;
    lon: number;
    chart_data?: any; // Cached calculation results
    created_at: string;
}

let profileCache: SavedHoroscope[] | null = null;

export const horoscopeService = {
    async saveHoroscope(data: Omit<SavedHoroscope, 'id' | 'created_at'>) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error("Please log in to save horoscopes.");

        const { error } = await supabase
            .from('horoscopes')
            .insert({
                user_id: user.id,
                name: data.name,
                gender: data.gender,
                dob: data.dob,
                tob: data.tob,
                pob: data.pob,
                lat: data.lat,
                lon: data.lon,
                chart_data: data.chart_data
            });

        if (error) throw error;
        profileCache = null; // Invalidate cache
    },

    async getSavedHoroscopes(forceRefresh = false) {
        if (profileCache && !forceRefresh) return profileCache;

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        const { data, error } = await supabase
            .from('horoscopes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        profileCache = data as SavedHoroscope[];
        return profileCache;
    },

    async deleteHoroscope(id: string) {
        const supabase = createClient();
        const { error } = await supabase
            .from('horoscopes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        if (profileCache) {
            profileCache = profileCache.filter(p => p.id !== id);
        }
    },

    clearCache() {
        profileCache = null;
    }
};
