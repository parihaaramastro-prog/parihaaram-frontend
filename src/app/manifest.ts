import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Pariharam — High-Precision Predictive Astrology',
        short_name: 'Pariharam',
        description: 'Advanced astronomical computing and analytical predictive insights powered by proprietary algorithms.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#4338ca',
        icons: [
            {
                src: '/parihaaram-logo.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    };
}
