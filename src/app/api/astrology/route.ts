import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { dob, tob, lat, lon } = await req.json();

        // 1. Convert IST (GMT+5:30) to UTC
        const [year, month, day] = dob.split("-").map(Number);
        const [hour, minute] = tob.split(":").map(Number);

        const localDate = new Date(year, month - 1, day, hour, minute);
        // Subtract 5.5 hours for UTC
        const utcDate = new Date(localDate.getTime() - (5.5 * 60 * 60 * 1000));

        const uY = utcDate.getFullYear();
        const uM = utcDate.getMonth() + 1;
        const uD = utcDate.getDate();
        const uH = utcDate.getHours();
        const uMn = utcDate.getMinutes();

        // 2. Call the Python Microservice
        // Default to localhost for development, environment variable for production
        const apiUrl = process.env.ASTRO_API_URL || "http://127.0.0.1:8000";

        const payload = {
            year: uY,
            month: uM,
            day: uD,
            hour: uH,
            minute: uMn,
            lat: lat,
            lon: lon
        };

        console.log(`Sending calculation request to: ${apiUrl}/calculate`);

        const apiResponse = await fetch(`${apiUrl}/calculate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-secret": process.env.API_SECRET || ""
            },
            body: JSON.stringify(payload),
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            throw new Error(`Astrology Engine Error (${apiResponse.status}): ${errorText}`);
        }

        const result = await apiResponse.json();

        if (result.error) {
            throw new Error(result.error);
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Astrology API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
