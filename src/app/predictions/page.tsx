import { Metadata } from 'next';
import PredictionsPage from "@/components/predictions/PredictionsPage";

export const metadata: Metadata = {
    title: "2026 Horoscope Predictions - Rashi & Lagna | Pariharam",
    description: "Detailed 2026 astrological predictions for all Moon Signs (Rashi) and Ascendants (Lagna). Available in English and Tamil.",
    keywords: ["2026 Horoscope", "Tamil Rashi Palan 2026", "Vedic Predictions 2026", "Lagna Palan 2026"],
    openGraph: {
        title: "2026 Horoscope Predictions - Rashi & Lagna",
        description: "Detailed 2026 astrological predictions for all signs.",
    }
};

export default function Predictions() {
    return <PredictionsPage />;
}
