"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
    const pathname = usePathname();

    // Don't show global footer on chat page (we'll place it manually inside the scroll area)
    if (pathname === '/chat') {
        return null;
    }

    return <Footer />;
}
