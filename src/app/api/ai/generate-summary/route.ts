import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": "https://parihaaram.in",
        "X-Title": "Parihaaram",
    }
});

export async function POST(req: NextRequest) {
    try {
        const { chartData, bio } = await req.json();

        if (!chartData) {
            return NextResponse.json({ error: "Chart data required" }, { status: 400 });
        }

        const prompt = `
You are an expert Vedic Astrologer. 
Analyze the following birth chart data and provide a high-level, personalized life prediction summary.
Keep it strictly under 150 words.
Focus on the core strengths and 1 major challenge of this chart.
Tone: Professional, Insightful, Empowering, yet grounded in Vedic principles.
Do NOT use jargon like "Lagna", "Lord of 5th", etc. Speak in plain English.
Address the user directly as "you".

User Profile:
Name: ${bio?.name || 'User'}
DOB: ${bio?.dob}

Chart Data:
Lagna: ${chartData.lagna?.name}
Moon Sign: ${chartData.moon_sign?.name}
Nakshatra: ${chartData.nakshatra?.name}
Current Mahadasha: ${chartData.mahadashas?.find((m: any) => m.is_current)?.planet || 'Unknown'}

Planetary Positions:
${chartData.planets?.map((p: any) => `${p.name} in ${p.sign} (House ${p.house})`).join('\n')}

Generate the summary now.
`;

        const completion = await openai.chat.completions.create({
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "user", content: prompt }],
        });

        const text = completion.choices[0].message.content || "";

        return NextResponse.json({ summary: text });

    } catch (error: any) {
        console.error("AI Summary Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
