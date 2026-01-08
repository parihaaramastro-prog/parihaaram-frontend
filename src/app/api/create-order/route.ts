import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount } = body; // Amount in smallest currency unit (paise)

        if (!amount) {
            return NextResponse.json({ error: "Amount required" }, { status: 400 });
        }

        const options = {
            amount: amount, // e.g., 4900 for ₹49.00
            currency: "INR",
            receipt: "receipt_" + Date.now(),
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(order);
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
