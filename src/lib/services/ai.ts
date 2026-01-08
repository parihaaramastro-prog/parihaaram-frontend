
import { SavedHoroscope } from "./horoscope";

export type ChatIntent = 'business' | 'love' | 'compatibility' | 'general' | 'health';

interface AIContext {
    primaryProfile?: SavedHoroscope;
    secondaryProfile?: SavedHoroscope; // For compatibility
    intent?: ChatIntent;
}

export interface AIResponse {
    reply: string;
    remainingCredits?: number;
}

export const aiService = {
    async generateResponse(query: string, context: AIContext, history: any[] = []): Promise<AIResponse> {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        ...history.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content })),
                        { role: 'user', content: query }
                    ],
                    context
                }),
            });

            const data = await response.json();

            if (response.status === 402) {
                throw new Error("OUT_OF_CREDITS");
            }

            if (!response.ok) {
                throw new Error("Failed to reach AI server");
            }

            return {
                reply: data.reply,
                remainingCredits: data.remainingCredits
            };

        } catch (error: any) {
            console.error("AI Service Error:", error);
            if (error.message === "OUT_OF_CREDITS") throw error;
            return {
                reply: "I am having trouble connecting to the cosmic consciousness (Server Error). Please check your internet connection or try again later.",
            };
        }
    }
};
