
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
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server Error: ${response.status}`);
            }

            if (typeof window !== 'undefined' && (window as any).posthog) {
                (window as any).posthog.capture('ai_response_generated', {
                    intent: context.intent,
                    credits_remaining: data.remainingCredits
                });
            }

            return {
                reply: data.reply,
                remainingCredits: data.remainingCredits
            };

        } catch (error: any) {
            console.error("AI Service Error:", error);
            if (error.message === "OUT_OF_CREDITS") throw error;
            // Return actual error for debugging
            return {
                reply: `(System Error): ${error.message || "Unknown error occurred"}. Please try again later.`,
            };
        }
    }
};
