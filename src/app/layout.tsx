import type { Metadata, Viewport } from "next";
import { Inter, Cardo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import FooterWrapper from "@/components/FooterWrapper";
import { CSPostHogProvider } from "@/lib/providers/PostHogProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const serif = Cardo({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
    metadataBase: new URL('https://parihaaram.in'),
    title: {
        default: "Pariharam — High-Precision Predictive Astrology",
        template: "%s | Pariharam"
    },
    description: "Advanced astronomical computing and analytical predictive insights powered by proprietary algorithms. Get accurate Vedic astrology predictions, horoscope analysis, and AI-powered insights.",
    keywords: [
        "Pariharam", "Precision Astrology", "Vedic Computing", "Predictive Analytics",
        "Horoscope", "Vedic Astrology", "Tamil Astrology", "AI Astrologer",
        "Birth Chart", "Jathagam", "Kundli", "Astrology Predictions 2026"
    ],
    authors: [{ name: "Pariharam Team" }],
    creator: "Pariharam",
    publisher: "Pariharam",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    icons: {
        icon: '/parihaaram-logo.png',
        shortcut: '/parihaaram-logo.png',
        apple: '/parihaaram-logo.png',
    },
    openGraph: {
        title: "Pariharam — High-Precision Predictive Astrology",
        description: "Advanced astronomical computing and analytical predictive insights powered by proprietary algorithms.",
        url: 'https://parihaaram.in',
        siteName: 'Pariharam',
        images: [
            {
                url: '/parihaaram-logo.png',
                width: 800,
                height: 800,
                alt: 'Pariharam Logo',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: "Pariharam — High-Precision Predictive Astrology",
        description: "Advanced astronomical computing and analytical predictive insights powered by proprietary algorithms.",
        images: ['/parihaaram-logo.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: 'https://parihaaram.in',
    },
    other: {
        "google-site-verification": "verification_token", // Replace with actual token
    }
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

import JsonLd from "@/components/JsonLd";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${serif.variable} font-sans antialiased min-h-screen`}>
                <JsonLd />
                <div className="app-bg-mesh" />
                <CSPostHogProvider>
                    <Navbar />
                    <main className="pt-24 md:pt-32 min-h-screen">
                        {children}
                    </main>
                    <FooterWrapper />
                </CSPostHogProvider>
            </body>
        </html>
    );
}
