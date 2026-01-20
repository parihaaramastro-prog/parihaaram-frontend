"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
    const pathname = usePathname();

    // Don't show global footer on chat or dashboard key routes
    if (pathname.startsWith('/chat') || pathname.startsWith('/dashboard')) {
        return null;
    }

    return <Footer />;
}
