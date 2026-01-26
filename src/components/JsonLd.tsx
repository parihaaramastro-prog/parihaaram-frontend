export default function JsonLd() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": "https://parihaaram.in/#website",
                "url": "https://parihaaram.in",
                "name": "Pariharam",
                "description": "High-Precision Predictive Astrology",
                "publisher": {
                    "@id": "https://parihaaram.in/#organization"
                },
                "inLanguage": "en-US"
            },
            {
                "@type": "Organization",
                "@id": "https://parihaaram.in/#organization",
                "name": "Pariharam",
                "url": "https://parihaaram.in",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://parihaaram.in/parihaaram-logo.png"
                },
                "sameAs": [
                    // Add social profiles here if available
                ]
            },
            {
                "@type": "Service",
                "serviceType": "Astrology Consultation",
                "provider": {
                    "@id": "https://pariharam.com/#organization"
                },
                "areaServed": "Global",
                "description": "Vedic Astrology Predictions and Horoscope Analysis"
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
