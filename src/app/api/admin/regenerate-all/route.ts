
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const maxDuration = 300; // Allow 5 minutes for processing

export async function GET(req: NextRequest) {
    // Basic security check (use a query param secret for quick access)
    const secret = req.nextUrl.searchParams.get('secret');
    if (secret !== process.env.API_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    try {
        // Fetch ALL horoscopes (limit to 100 for safety, loop if needed)
        const { data: horoscopes, error } = await supabase
            .from('horoscopes')
            .select('id, user_id, name, dob, tob, lat, lon')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!horoscopes || horoscopes.length === 0) {
            return NextResponse.json({ message: "No horoscopes found to regenerate." });
        }

        const results = [];
        const errors = [];

        console.log(`Starting regeneration for ${horoscopes.length} horoscopes...`);

        for (const h of horoscopes) {
            try {
                // Skip invalid records
                if (!h.dob || !h.tob || !h.lat || !h.lon) {
                    errors.push({ id: h.id, error: "Missing birth details" });
                    continue;
                }

                // 1. Convert IST (GMT+5:30) to UTC safely
                // Format of dob: YYYY-MM-DD
                // Format of tob: HH:MM:SS or HH:MM
                const [year, month, day] = h.dob.split("-").map(Number);
                const [hour, minute] = h.tob.split(":").map(Number);

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
                const apiUrl = process.env.ASTRO_API_URL || "http://127.0.0.1:8000";

                const payload = {
                    year: uY,
                    month: uM,
                    day: uD,
                    hour: uH,
                    minute: uMn,
                    lat: h.lat,
                    lon: h.lon
                };

                // Add retry logic or timeout if needed
                const apiResponse = await fetch(`${apiUrl}/calculate`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-secret": process.env.API_SECRET || ""
                    },
                    body: JSON.stringify(payload),
                });

                if (!apiResponse.ok) {
                    const txt = await apiResponse.text();
                    throw new Error(`API Error: ${apiResponse.status} ${txt}`);
                }

                const chartData = await apiResponse.json();

                if (chartData.error) {
                    throw new Error(chartData.error);
                }

                // 3. Update the record
                const { error: updateError } = await supabase
                    .from('horoscopes')
                    .update({
                        chart_data: chartData,
                        // Update 'ai_summary' to null to trigger regeneration if needed? Or keep specific field logic
                    })
                    .eq('id', h.id);

                if (updateError) throw updateError;

                results.push({ id: h.id, name: h.name, status: "updated" });
                console.log(`Updated horoscope for ${h.name} (${h.id})`);

            } catch (err: any) {
                console.error(`Failed to update ${h.id}:`, err);
                errors.push({ id: h.id, name: h.name, error: err.message });
            }
        }

        return NextResponse.json({
            message: "Regeneration complete",
            total: horoscopes.length,
            success_count: results.length,
            error_count: errors.length,
            results,
            errors
        });

    } catch (error: any) {
        console.error("Regeneration Fatal Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
