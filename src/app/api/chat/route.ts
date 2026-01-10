
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();

        // Initialize Supabase Server Client
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        // API routes normally don't set cookies, but needed for auth refresh
                    },
                    remove(name: string, options: CookieOptions) {
                    },
                },
            }
        );

        // 1. Check Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Check Credits
        let { data: creditData } = await supabase
            .from('user_credits')
            .select('credits')
            .eq('user_id', user.id)
            .single();

        // If no record, create one (Trial)
        if (!creditData) {
            const { data: newCredit } = await supabase
                .from('user_credits')
                .insert({ user_id: user.id, credits: 3 }) // 3 Free Trial Messages
                .select()
                .single();
            creditData = newCredit;
        }

        if (!creditData || creditData.credits <= 0) {
            return NextResponse.json({
                error: "Insufficient credits. Please top up to continue.",
                isOutOfCredits: true
            }, { status: 402 });
        }

        // 3. Fetch System Settings for Model Selection
        const { data: settings } = await supabase
            .from('app_settings')
            .select('*')
            .single();

        const selectedModel = settings?.ai_model || 'gpt-4o'; // Default to GPT-4o

        const body = await req.json();
        const { messages, context } = body;

        // Construct System Prompt
        const currentDate = new Date().toDateString();
        let systemPrompt = `You are Parihaaram AI — a calm, senior life strategist powered by Vedic astrology logic.
Current Date: ${currentDate}.

Your role is NOT to motivate, comfort, or reassure.
Your role is to ANALYZE, DECIDE, and GUIDE clearly.

You speak like:
- A composed mentor
- A strategic advisor
- Someone who has seen many life cycles
Tone: calm, grounded, firm, respectful, never dramatic.

━━━━━━━━━━━━━━━━━━
CORE PRINCIPLES
━━━━━━━━━━━━━━━━━━

1. DECISIVENESS FIRST
- Wherever possible, give clear YES / NO answers.
- Avoid vague language like “maybe”, “it depends”, or “could be”.
- If something is not supported, say it directly.

2. NO MOTIVATION TALK
- Do NOT use motivational phrases.
- Do NOT say “everything will be fine”.
- Do NOT hype the user.
- Truth over comfort.

3. NO TECHNICAL ASTROLOGY JARGON
- NEVER explain astrology terms.
- NEVER say words like Lagna, Dasha, Bhukti, Rasi in the reply.
- Internally use astrology, but externally speak in life-language:
  “your nature”, “this phase”, “the next period”, “your pattern”.

4. TIME-BASED THINKING
- Always anchor advice in:
  - What is happening NOW
  - What changes NEXT
  - What should be done in THIS phase
- Speak in timelines, not destiny statements.

5. AGENCY & RESPONSIBILITY
- Never remove user agency.
- Never imply fate is unavoidable.
- Show trade-offs and consequences.

━━━━━━━━━━━━━━━━━━
CAREER & MONEY RULES
━━━━━━━━━━━━━━━━━━

When answering career or money questions:
- Prefer stability before ambition.
- Favor backend, systems, operations, services, execution.
- Discourage chaos, hype, early big business risks.
- Emphasize consistency, repeatability, and control.

━━━━━━━━━━━━━━━━━━
RELATIONSHIPS & LIFE QUESTIONS
━━━━━━━━━━━━━━━━━━

- Be emotionally honest, not romantic.
- Acknowledge desire without shame.
- Do not encourage desperation or dependency.
- Explain emotional patterns clearly and directly.

━━━━━━━━━━━━━━━━━━
STRICTLY AVOID
━━━━━━━━━━━━━━━━━━

- Religious preaching
- Fear-based dosham talk
- Remedies unless explicitly asked
- Spiritual clichés
- Excessive empathy
- Overlong answers

━━━━━━━━━━━━━━━━━━
ANSWER STRUCTURE (IMPORTANT)
━━━━━━━━━━━━━━━━━━

Prefer this structure:
- Short direct answer
- Explanation (why)
- What to do now
- What to avoid

If the user is confused, help them simplify — not explore more options.

━━━━━━━━━━━━━━━━━━
PHILOSOPHY
━━━━━━━━━━━━━━━━━━

“Stability first.
Clarity next.
Growth later.
Life improves with alignment, not speed.”

IMPORTANT:
If the user is anxious or comparing themselves to others,
do NOT soothe them emotionally.
Ground them with facts, patterns, and next actions.
`;

        if (context) {
            const { primaryProfile, secondaryProfile } = context;

            if (primaryProfile && primaryProfile.chart_data) {
                const c = primaryProfile.chart_data;
                const dasha = c.mahadashas?.find((m: any) => m.is_current);
                const bhukti = dasha?.bhuktis?.find((b: any) => b.is_current);

                systemPrompt += `\n\nActive Profile Context:
Name: ${primaryProfile.name}
Birth Details: ${primaryProfile.dob} at ${primaryProfile.tob} in ${primaryProfile.pob}
Coordinates: ${primaryProfile.lat}, ${primaryProfile.lon}
Lagna (Ascendant): ${c.lagna?.name}
Rasi (Moon Sign): ${c.moon_sign?.name}
Nakshatra: ${c.nakshatra?.name}
Current Dasha: ${dasha?.planet || 'Unk'} (Ends: ${dasha?.end_date})
Current Bhukti: ${bhukti?.planet || 'Unk'} (Ends: ${bhukti?.end_date})
Planetary Positions: ${c.planets?.map((p: any) => `${p.name} in ${p.rashi} (House ${p.house})`).join(', ')}
`;
            }

            if (secondaryProfile && secondaryProfile.chart_data) {
                const c2 = secondaryProfile.chart_data;
                systemPrompt += `\n\nComparison Profile (Partner/Other):
Name: ${secondaryProfile.name}
Lagna: ${c2.lagna?.name}
Rasi: ${c2.moon_sign?.name}
Nakshatra: ${c2.nakshatra?.name}
`;
            }
        }

        // Determine Temperature
        const lastMessage = messages[messages.length - 1]?.content || "";
        const isDecisionQuestion = lastMessage.includes("?") ||
            lastMessage.toLowerCase().startsWith("should") ||
            lastMessage.toLowerCase().startsWith("can i");
        const temperature = isDecisionQuestion ? 0.4 : 0.7;

        let reply = "";

        console.log(`--- Using Model: ${selectedModel.toUpperCase()} ---`);

        if (selectedModel.startsWith('gemini')) {
            // --- GEMINI HANDLER ---
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-pro",
                systemInstruction: systemPrompt,
            });

            // Convert OpenAI format messages to Gemini format (Content + Role)
            // Gemini roles: 'user' or 'model'
            const history = messages.slice(0, -1).map((m: any) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

            // Start chat with history
            const chat = model.startChat({
                history: history,
                generationConfig: {
                    maxOutputTokens: 500,
                    temperature: temperature,
                },
            });

            const result = await chat.sendMessage(lastMessage);
            reply = result.response.text();

        } else {
            // --- OPENAI HANDLER (Default) ---
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages
                ],
                temperature: temperature,
                max_tokens: 500,
            });

            reply = completion.choices[0].message.content || "";
        }

        console.log("LLM Reply:", reply);
        console.log("------------------------------------------------------------------");

        // 4. Deduct Credit
        const { data: updatedCredit } = await supabase
            .from('user_credits')
            .update({ credits: creditData.credits - 1 })
            .eq('user_id', user.id)
            .select()
            .single();

        return NextResponse.json({
            reply,
            remainingCredits: updatedCredit ? updatedCredit.credits : (creditData.credits - 1)
        });

    } catch (error: any) {
        console.error("AI API Error:", error);
        return NextResponse.json(
            { error: "Failed to consult the stars. Please try again later." },
            { status: 500 }
        );
    }
}
