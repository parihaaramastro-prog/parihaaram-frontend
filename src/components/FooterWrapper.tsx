"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
    const pathname = usePathname();

    // Don't show global footer on chat, dashboard, or admin routes
    if (pathname.startsWith('/chat') || pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/astrologer')) {
        return null;
    }

    return <Footer />;
}
