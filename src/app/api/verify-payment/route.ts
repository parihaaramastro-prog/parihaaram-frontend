import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderCreationId, razorpayPaymentId, razorpaySignature } = body;

        const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';

        const shasum = crypto.createHmac("sha256", secret);
        shasum.update(orderCreationId + "|" + razorpayPaymentId);
        const digest = shasum.digest("hex");

        if (digest !== razorpaySignature) {
            return NextResponse.json({ msg: "Transaction not legit!" }, { status: 400 });
        }

        // Transaction is Valid
        // In a real app, you would add credits here server-side.
        // For now, we return success and let the client handle the update (or we could move logic here).

        return NextResponse.json({
            msg: "success",
            orderId: orderCreationId,
            paymentId: razorpayPaymentId,
        });

    } catch (error) {
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
