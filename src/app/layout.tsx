import type { Metadata, Viewport } from "next";
import { Inter, Cardo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import FooterWrapper from "@/components/FooterWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const serif = Cardo({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
    title: "Pariharam — High-Precision Predictive Astrology",
    description: "Advanced astronomical computing and analytical predictive insights powered by proprietary algorithms.",
    keywords: ["Pariharam", "Precision Astrology", "Vedic Computing", "Predictive Analytics"],
    icons: {
        icon: '/parihaaram-logo.png',
        shortcut: '/parihaaram-logo.png',
        apple: '/parihaaram-logo.png',
    }
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${serif.variable} font-sans antialiased min-h-screen`}>
                <div className="app-bg-mesh" />
                <Navbar />
                <main className="pt-32 md:pt-40 min-h-screen">
                    {children}
                </main>
                <FooterWrapper />
            </body>
        </html>
    );
}
