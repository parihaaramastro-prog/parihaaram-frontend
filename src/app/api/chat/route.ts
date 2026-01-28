
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { GoogleGenAI } from "@google/genai";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Gemini client
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper: Calculate Chart Data on the fly if missing
async function calculateChartData(dob: string, tob: string, lat: number, lon: number) {
    try {
        const [year, month, day] = dob.split("-").map(Number);
        const [hour, minute] = tob.split(":").map(Number);

        const inputAsUtcMs = Date.UTC(year, month - 1, day, hour, minute);
        const istOffsetMs = 5.5 * 60 * 60 * 1000;
        const trueUtcMs = inputAsUtcMs - istOffsetMs;
        const utcDate = new Date(trueUtcMs);

        const payload = {
            year: utcDate.getUTCFullYear(),
            month: utcDate.getUTCMonth() + 1,
            day: utcDate.getUTCDate(),
            hour: utcDate.getUTCHours(),
            minute: utcDate.getUTCMinutes(),
            lat: lat,
            lon: lon
        };

        const apiUrl = process.env.ASTRO_API_URL || "http://127.0.0.1:8000";
        console.log(`[Chat API] Connecting to Astro Engine at: ${apiUrl}`);

        const apiResponse = await fetch(`${apiUrl}/calculate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!apiResponse.ok) {
            console.error(`[Chat API] Astro Engine Error: ${apiResponse.status}`);
            return null;
        }
        return await apiResponse.json();
    } catch (e) {
        console.error("On-the-fly calculation failed:", e);
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();

        // ... (rest of auth/settings logic)


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

        const selectedModel = settings?.ai_model || 'gemini-2.0-flash'; // Default to Gemini 2.0 Flash

        const body = await req.json();
        const { messages, context } = body;

        console.log("-----------------------------------------");
        console.log("[Chat API] Request Body Context Check:");
        if (context) {
            const { primaryProfile, secondaryProfile } = context;
            console.log("Primary:", primaryProfile?.name, "ChartData:", !!primaryProfile?.chart_data);
            console.log("Secondary:", secondaryProfile?.name, "ChartData:", !!secondaryProfile?.chart_data);
        } else {
            console.log("CONTEXT IS MISSING OR NULL");
        }
        console.log("-----------------------------------------");

        // Construct System Prompt
        const currentDate = new Date().toDateString();
        const defaultPrompt = "";

        // Determine if system prompt is active
        const isPromptActive = (settings as any)?.is_prompt_active !== false;

        let systemPrompt = "";

        // MASTER PROMPT: Only apply for the FIRST message (initial life prediction)
        // Check if this is the first message in the conversation
        const isFirstMessage = messages.length === 0 || (messages.length === 1 && messages[0].role === 'user');
        const masterPrompt = settings?.master_prompt || "";

        if (masterPrompt && isFirstMessage) {
            systemPrompt = masterPrompt + "\n\n";
            console.log('[Master Prompt] Applied for initial life prediction');
        } else if (!isFirstMessage) {
            console.log('[Master Prompt] Skipped - not first message');
        }

        if (isPromptActive) {
            const regularPrompt = settings?.system_prompt || defaultPrompt;

            // Allow dynamic date injection if the prompt from DB has the placeholder
            let processedPrompt = regularPrompt.replace("${currentDate}", currentDate);

            if (!processedPrompt.includes("Current Date:")) {
                processedPrompt = `Current Date: ${currentDate}.\n\n` + processedPrompt;
            }

            systemPrompt += processedPrompt;
        } else {
            // Minimal prompt: RAW MODE
            // "no prompt just data sending to ai model but in that if user asks anything about what ai you are please dont tell"
            systemPrompt += `Current Date: ${currentDate}.
You are a helpful assistant.
PRIVACY CHECK: If the user asks about your underlying AI model (e.g. GPT, Gemini, Cluade) or your identity, do NOT reveal the model name. Simply state you are Parihaaram AI.
Otherwise, answer the user's question directly based on the provided context.`;
        }

        // Add dynamic response length instruction for non-initial messages
        if (!isFirstMessage) {
            const lastMessage = messages[messages.length - 1]?.content || "";
            const isDetailRequest = lastMessage.toLowerCase().includes("detail") ||
                lastMessage.toLowerCase().includes("explain more") ||
                lastMessage.toLowerCase().includes("elaborate");

            if (!isDetailRequest) {
                systemPrompt += `\n\nIMPORTANT: Keep your response CONCISE and to the point (around 5 lines or 100 words). Be clear and direct. The user can ask for more details if needed.`;
            }
        }

        if (context) {
            const { primaryProfile, secondaryProfile } = context;

            // FALLBACK: If chart_data is missing, calculate it now
            if (primaryProfile && !primaryProfile.chart_data) {
                console.log(`[Chat API] Missing chart_data for primary (${primaryProfile.name}). Calculating...`);
                primaryProfile.chart_data = await calculateChartData(
                    primaryProfile.dob,
                    primaryProfile.tob,
                    primaryProfile.lat || 13.0827,
                    primaryProfile.lon || 80.2707
                );
            }
            if (secondaryProfile && !secondaryProfile.chart_data) {
                console.log(`[Chat API] Missing chart_data for secondary (${secondaryProfile.name}). Calculating...`);
                secondaryProfile.chart_data = await calculateChartData(
                    secondaryProfile.dob,
                    secondaryProfile.tob,
                    secondaryProfile.lat || 13.0827,
                    secondaryProfile.lon || 80.2707
                );
            }

            if (primaryProfile && primaryProfile.chart_data) {
                const c = primaryProfile.chart_data;
                const dasha = c.mahadashas?.find((m: any) => m.is_current);
                const bhukti = dasha?.bhuktis?.find((b: any) => b.is_current);

                // --- NEW: Age & Life Stage Calculation ---
                const birthDate = new Date(primaryProfile.dob);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                let lifeStage = "Unknown";
                if (age < 18) {
                    lifeStage = "Schooling Period (Foundational Learning & Childhood)";
                } else if (age >= 18 && age < 23) {
                    lifeStage = "College / Higher Education (UG/PG) Phase";
                } else if (age >= 23 && age < 26) {
                    lifeStage = "Early Career / Entry Level / Struggle & Exploration Phase";
                } else {
                    lifeStage = "Career Growth / Family / Settling Down / Stability Phase";
                }

                // --- NEW: Birth Dasha (First in sequence) ---
                const birthDashaObj = c.mahadashas && c.mahadashas.length > 0 ? c.mahadashas[0] : null;
                const birthBhuktiObj = birthDashaObj?.bhuktis && birthDashaObj.bhuktis.length > 0 ? birthDashaObj.bhuktis[0] : null;

                const birthDashaStr = birthDashaObj ? `${birthDashaObj.planet} Dasha (Ended: ${birthDashaObj.end_date})` : "Unknown";
                const birthBhuktiStr = birthBhuktiObj ? `${birthBhuktiObj.planet} Bhukti (Ended: ${birthBhuktiObj.end_date})` : "Unknown";
                // ----------------------------------------

                // Helper to get Sign Index from Name (0=Aries, 11=Pisces)
                const getSignIndex = (name: string | undefined | null): number => {
                    if (!name) return -1;
                    const n = name.toLowerCase().trim();
                    if (n.includes('aries') || n.includes('mesha')) return 0;
                    if (n.includes('taurus') || n.includes('vrish')) return 1;
                    if (n.includes('gemini') || n.includes('mith')) return 2;
                    if (n.includes('cancer') || n.includes('karka')) return 3;
                    if (n.includes('leo') || n.includes('simha')) return 4;
                    if (n.includes('virgo') || n.includes('kanya')) return 5;
                    if (n.includes('libra') || n.includes('tula')) return 6;
                    if (n.includes('scorpio') || n.includes('vrishchi')) return 7;
                    if (n.includes('sagitt') || n.includes('dhanu')) return 8;
                    if (n.includes('capri') || n.includes('makara')) return 9;
                    if (n.includes('aquar') || n.includes('kumbha')) return 10;
                    if (n.includes('pisces') || n.includes('meena')) return 11;
                    return -1; // Unknown
                };

                const lagnaIdx = typeof c.lagna?.idx === 'number' ? c.lagna.idx : getSignIndex(c.lagna?.name || '');
                const lagnaDegree = typeof c.lagna?.degrees === 'number' ? c.lagna.degrees.toFixed(2) : c.lagna?.degrees ?? '0';

                console.log(`[AI Context] Lagna: ${c.lagna?.name} (Idx: ${lagnaIdx}) -> House 1 Reference`);

                // Recalculate Planets with strict Whole Sign logic
                const planetsContext = c.planets?.map((p: any) => {
                    // Check both 'rashi' and 'sign' properties as the backend format might vary
                    const signName = p.rashi || p.sign || p.sign_name || "Unknown";
                    const idx = getSignIndex(signName);
                    let wsHouse = 0;
                    if (idx !== -1 && lagnaIdx !== -1) {
                        wsHouse = ((idx - lagnaIdx + 12) % 12) + 1;
                    }
                    const deg = typeof p.degrees === 'number' ? p.degrees.toFixed(2) : p.degrees;
                    return `- ${p.name}: ${signName} at ${deg}° (House ${wsHouse > 0 ? wsHouse : p.house + ' [Source]'} - Whole Sign)`;
                }).join('\n');

                // --- NEW: Full Dasha Timeline (Limited to 20 years into future) ---
                const dashaTimeline = c.mahadashas?.filter((m: any) => {
                    // Check if data has start_date (it should, based on usage elsewhere)
                    // If not, fallback to using end_date of previous or just include all.
                    // But assuming structure is consistent with frontend:
                    if (!m.start_date) return true;
                    const currentYear = new Date().getFullYear();
                    const limitYear = currentYear + 20;
                    const startYear = parseInt(m.start_date.split('-')[2]);
                    return startYear <= limitYear;
                }).map((m: any) => {
                    const isCurrent = m.is_current ? " (CURRENT)" : "";
                    return `- ${m.planet} Mahadasha: ${m.start_date} to ${m.end_date}${isCurrent}`;
                }).join('\n');

                systemPrompt += `\n\nActive Profile Context:
Name: ${primaryProfile.name}
Birth Details: ${primaryProfile.dob} at ${primaryProfile.tob} in ${primaryProfile.pob}
Age: ${age} years
Life Stage: ${lifeStage}

Coordinates: ${primaryProfile.lat}, ${primaryProfile.lon}
Lagna (Ascendant): ${c.lagna?.name} (Sign Index: ${lagnaIdx}) at ${lagnaDegree}°
IMPORTANT REFERENCE: In this chart, ${c.lagna?.name} is the 1st House. Calculation starts from ${c.lagna?.name}.

Rasi (Moon Sign): ${c.moon_sign?.name}
Nakshatra: ${c.nakshatra?.name}

--- TIMING & DASHA TIMELINE (Past, Present & Future) ---
Birth Dasha: ${birthDashaStr}
Current Phase: ${dasha?.planet || 'Unk'} / ${bhukti?.planet || 'Unk'}

Full Mahadasha Sequence:
${dashaTimeline}

Planetary Positions (Calculated Whole Sign Houses relative to ${c.lagna?.name}):
${planetsContext}

IMPORTANT: TRUST the 'House' column above. It is pre-calculated using strict WHOLE SIGN logic relative to the Ascendant.
- Ascendant Sign (${c.lagna?.name}) = House 1.
- Next Sign = House 2, etc.
- Ignore any conflicting house information from your own training if it contradicts the list above.
`;
            } else if (primaryProfile) {
                // FALLBACK: Raw Input Context
                systemPrompt += `\n\nActive Profile Context (Calculation Unavailable):
Name: ${primaryProfile.name}
Birth Details: ${primaryProfile.dob} at ${primaryProfile.tob} in ${primaryProfile.pob}
Note: Precise planetary positions are currently unavailable. Answer based on general astrological principles for this birth date or ask the user for clarification if critical.
`;
            }

            if (secondaryProfile && secondaryProfile.chart_data) {
                const c2 = secondaryProfile.chart_data;
                systemPrompt += `\n\nComparison Profile (Partner/Other):
Name: ${secondaryProfile.name}
Birth Details: ${secondaryProfile.dob} at ${secondaryProfile.tob || '12:00'} in ${secondaryProfile.pob || 'Unknown'}
Lagna: ${c2.lagna?.name}
Rasi: ${c2.moon_sign?.name}
Nakshatra: ${c2.nakshatra?.name}
`;
            } else if (secondaryProfile) {
                systemPrompt += `\n\nComparison Profile (Partner/Other):
Name: ${secondaryProfile.name}
Birth Details: ${secondaryProfile.dob} at ${secondaryProfile.tob || '12:00'} in ${secondaryProfile.pob || 'Unknown'}
Note: Precise chart data unavailable.
`;
            }
        }

        // Determine Temperature
        console.log("------------------------------------------------------------------");
        console.log("--- SYSTEM PROMPT & CONTEXT ---");
        console.log(systemPrompt);
        console.log("------------------------------------------------------------------");

        const lastMessage = messages[messages.length - 1]?.content || "";
        const isDecisionQuestion = lastMessage.includes("?") ||
            lastMessage.toLowerCase().startsWith("should") ||
            lastMessage.toLowerCase().startsWith("can i");
        const temperature = isDecisionQuestion ? 0.4 : 0.7;

        // Dynamic token limits based on message type
        const isDetailRequest = lastMessage.toLowerCase().includes("detail") ||
            lastMessage.toLowerCase().includes("explain more") ||
            lastMessage.toLowerCase().includes("elaborate") ||
            lastMessage.toLowerCase().includes("in depth");

        const maxTokens = isFirstMessage ? 800 : (isDetailRequest ? 600 : 300); // Initial: 800, Detail: 600, General: 300
        console.log(`[Token Limit] ${maxTokens} tokens (${isFirstMessage ? 'Initial Prediction' : isDetailRequest ? 'Detail Request' : 'Concise Response'})`);

        let reply = "";

        console.log(`--- Using Model: ${selectedModel.toUpperCase()} ---`);

        if (selectedModel.startsWith('gemini')) {
            console.log(`--- Using Model: GEMINI-2.0-FLASH ---`);
            // --- GEMINI HANDLER ---

            // Map messages to Gemini Content format
            const contents = messages
                .filter((m: any) => m.role === 'user' || m.role === 'assistant')
                .map((m: any) => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }));

            try {
                const response = await genAI.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: contents,
                    config: {
                        systemInstruction: systemPrompt,
                        temperature: temperature,
                        maxOutputTokens: maxTokens,
                    },
                });

                reply = response.text || "";
            } catch (flashError: any) {
                console.error("⚠️ GEMINI 2.5 FLASH FAILED:", flashError.message);
                throw flashError;
            }

        } else {
            // --- OPENAI HANDLER (Default) ---
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages
                ],
                temperature: temperature,
                max_tokens: maxTokens,
            });

            reply = completion.choices[0].message.content || "";
        }

        console.log("LLM Reply:", reply);
        console.log("------------------------------------------------------------------");


        // Log to DB (Fire and forget, don't await blocking)
        supabase.from('chat_logs').insert({
            user_id: user.id,
            model: selectedModel,
            user_message: lastMessage,
            ai_response: reply,
            system_prompt_snapshot: systemPrompt,
            context_snapshot: JSON.stringify(context || {})
        }).then(({ error }) => {
            if (error) console.warn("Failed to log chat:", error.message);
        });

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
