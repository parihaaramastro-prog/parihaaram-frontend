
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
    id: string;
    text: string;
    level: number;
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "0px 0px -80% 0px" }
        );

        headings.forEach((heading) => {
            const element = document.getElementById(heading.id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [headings]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100, // Offset for fixed header
                behavior: "smooth",
            });
            setActiveId(id);
        }
    };

    return (
        <nav className="sticky top-32 w-full pr-4 hidden lg:block">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">
                Contents
            </h4>
            <ul className="space-y-3 border-l-2 border-slate-100">
                {headings.map((heading) => (
                    <li key={heading.id}>
                        <a
                            href={`#${heading.id}`}
                            onClick={(e) => handleClick(e, heading.id)}
                            className={cn(
                                "block text-sm py-1 transition-all duration-300 border-l-2 -ml-[2px] px-4",
                                activeId === heading.id
                                    ? "border-indigo-600 text-indigo-600 font-bold"
                                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                            )}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
