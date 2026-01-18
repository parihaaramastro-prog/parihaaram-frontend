import { createClient } from "@/lib/supabase";

export interface ChatMessage {
    id: string;
    role: 'user' | 'ai' | 'system';
    content: string;
    created_at: string; // ISO string
    is_hidden: boolean;
    metadata?: any;
}

export interface ChatSession {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
    primary_profile_id?: string;
    secondary_profile_id?: string;
    messages?: ChatMessage[]; // Optional, hydrated when fetching detailed session
}

export const chatService = {
    async createSession(userId: string, title: string = "New Chat", primaryProfileId?: string, secondaryProfileId?: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('chat_sessions')
            .insert({
                user_id: userId,
                title,
                primary_profile_id: primaryProfileId,
                secondary_profile_id: secondaryProfileId
            })
            .select()
            .single();

        if (error) throw error;
        return data as ChatSession;
    },

    async getSessions(userId: string) {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data as ChatSession[];
    },

    async getSessionWithMessages(sessionId: string) {
        const supabase = createClient();

        // Fetch session
        const { data: sessionData, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

        if (sessionError) throw sessionError;

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        const session = sessionData as ChatSession;
        session.messages = messagesData as ChatMessage[];
        return session;
    },

    async addMessage(sessionId: string, role: 'user' | 'ai' | 'system', content: string, isHidden: boolean = false, metadata?: any) {
        const supabase = createClient();

        // 1. Insert Message
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                session_id: sessionId,
                role,
                content,
                is_hidden: isHidden,
                metadata
            })
            .select()
            .single();

        if (error) throw error;

        // 2. Update Session UpdatedAt and optionally Title (if logic requires)
        // We just update the timestamp
        await supabase
            .from('chat_sessions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', sessionId);

        return data as ChatMessage;
    },

    async updateSessionTitle(sessionId: string, title: string) {
        const supabase = createClient();
        const { error } = await supabase
            .from('chat_sessions')
            .update({ title })
            .eq('id', sessionId);

        if (error) throw error;
    },

    async updateSessionProfiles(sessionId: string, primaryId?: string, secondaryId?: string) {
        const supabase = createClient();
        const updates: any = {};
        if (primaryId !== undefined) updates.primary_profile_id = primaryId;
        if (secondaryId !== undefined) updates.secondary_profile_id = secondaryId;

        const { error } = await supabase
            .from('chat_sessions')
            .update(updates)
            .eq('id', sessionId);

        if (error) throw error;
    },

    async deleteSession(sessionId: string) {
        const supabase = createClient();
        const { error } = await supabase.from('chat_sessions').delete().eq('id', sessionId);
        if (error) throw error;
    }
};
