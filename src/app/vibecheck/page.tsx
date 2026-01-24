import { Metadata } from 'next';
import VibeCheckLanding from "@/components/vibecheck/VibeCheckPage";

export const metadata: Metadata = {
    title: "Vibe Check | Relationship & Love Compatibility Calculator | Pariharam",
    description: "Check your romantic compatibility score based on Nakshatra resonance. Our algorithm uses coordinate math to reveal the raw chemistry between you and your partner.",
    keywords: ["Stars Vibe Check", "Love Compatibility", "Nakshatra Matching", "Astrology Relationship", "Kundli Matching", "Vedic Compatibility"],
    openGraph: {
        title: "Is it Love or Loophole? | Vibe Check Score",
        description: "Calculate your cosmic chemistry score instantly.",
        type: "website",
    }
};

export default function VibeCheckPage() {
    return <VibeCheckLanding />;
}
