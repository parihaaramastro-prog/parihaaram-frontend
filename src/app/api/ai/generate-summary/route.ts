import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

        const response = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }]
        });

        const text = response.text || "";

        return NextResponse.json({ summary: text });

    } catch (error: any) {
        console.error("AI Summary Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
