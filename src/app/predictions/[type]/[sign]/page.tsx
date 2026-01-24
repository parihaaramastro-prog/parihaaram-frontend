import { Metadata } from 'next';
import DetailedPredictionContent from '@/components/predictions/DetailedPredictionContent';
import { RASHI_PREDICTIONS, LAGNA_PREDICTIONS, RASHI_PREDICTIONS_TA, LAGNA_PREDICTIONS_TA } from '@/lib/predictions-2026';

type Props = {
    params: Promise<{
        type: string;
        sign: string;
    }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { type, sign } = await params;

    // Default to English for initial metadata. 
    // Ideally, we would inspect searchParams, but generateMetadata context doesn't always have easy access to searchParams for static pages efficiently
    const dataSet = type === 'rashi' ? RASHI_PREDICTIONS : LAGNA_PREDICTIONS;

    // Case insensitive lookup
    const match = Object.keys(dataSet).find(k => k.toLowerCase() === sign.toLowerCase());

    // Use type assertion for key access as we found the match
    const data = match ? (dataSet as any)[match] : null;

    if (data) {
        return {
            title: `${data.title} - 2026 Horoscope Predictions | Pariharam`,
            description: data.overview.substring(0, 160), // Optimize for SEO length
            keywords: [`${sign} 2026 prediction`, `${sign} rashi palan`, "2026 horoscope", "Tamil astrology"],
            openGraph: {
                title: `${data.title}`,
                description: data.overview,
                type: 'article',
            }
        };
    }

    return {
        title: 'Horoscope Prediction Not Found | Pariharam',
        description: 'Detailed Vedic astrology predictions for 2026.'
    };
}

export default function DetailedPredictionPage() {
    return <DetailedPredictionContent />;
}
