import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { dob, tob, lat, lon } = await req.json();

        // 1. Convert IST (GMT+5:30) to UTC safely
        // We treat the input time as if it were UTC to get the absolute milliseconds, 
        // then shift by 5.5 hours to get the actual UTC moment.
        const [year, month, day] = dob.split("-").map(Number);
        const [hour, minute] = tob.split(":").map(Number);

        // Date.UTC returns ms for that date/time located at Greenwich
        // effectively treating our IST input "as is"
        const inputAsUtcMs = Date.UTC(year, month - 1, day, hour, minute);

        // Subtract 5.5 hours (IST offset) to get the True UTC Timestamp
        // 5.5 hours * 60 mins * 60 secs * 1000 ms
        const istOffsetMs = 5.5 * 60 * 60 * 1000;
        const trueUtcMs = inputAsUtcMs - istOffsetMs;

        const utcDate = new Date(trueUtcMs);

        const uY = utcDate.getUTCFullYear();
        const uM = utcDate.getUTCMonth() + 1;
        const uD = utcDate.getUTCDate();
        const uH = utcDate.getUTCHours();
        const uMn = utcDate.getUTCMinutes();

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

        console.log("---------------------------------------------------");
        console.log(`ASTRO REQUEST: IST Input: ${dob} ${tob}`);
        console.log(`ASTRO REQUEST: Calculated UTC: ${uY}-${uM}-${uD} ${uH}:${uMn}`);
        console.log(`ASTRO REQUEST: Lat/Lon: ${lat}, ${lon}`);
        console.log("---------------------------------------------------");

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
