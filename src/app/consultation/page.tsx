import { Metadata } from 'next';
import ConsultationPage from "@/components/consultation/ConsultationPage";

export const metadata: Metadata = {
    title: "Astrology Consultation & Expert Guidance | Pariharam",
    description: "Get personalized Vedic astrology consultations for career, marriage, health, and wealth. Connect with our expert astrologers for detailed reports.",
    keywords: ["Astrology Consultation", "Vedic Astrology Service", "Career Astrology", "Marriage Matching", "Ask an Astrologer"],
    openGraph: {
        title: "Expert Astrology Consultation",
        description: "Connect with expert astrologers for personalized guidance.",
        type: "website",
    }
};

export default function Consultation() {
    return <ConsultationPage />;
}
