import { Metadata } from 'next';
import AIAstrologerLanding from "@/components/ai/AILandingPage";

export const metadata: Metadata = {
    title: "AI Personal Astrologer in Tamil & English | Pariharam",
    description: "Chat with the world's most advanced AI Astrologer. Get instant, accurate answers about your career, marriage, and health based on your unique birth chart.",
    keywords: ["AI Astrologer", "Vedic Astrology AI", "Chat with Astrologer", "Free Astrology Chat", "Tamil Astrology AI"],
    openGraph: {
        title: "AI Personal Astrologer in Tamil & English",
        description: "Get instant, accurate answers about your career, marriage, and health based on your unique birth chart.",
        images: ['/parihaaram-logo.png'], // Better if we had a specific AI feature image
    }
};

export default function AIPage() {
    return <AIAstrologerLanding />;
}
