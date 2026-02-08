'use client';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_uq2Bl5NolOwBNBhy3QY72pgDKAW90vwIQCATH4buThC', {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
        defaults: '2025-11-30' as any, // Cast as any if TS complains, but adding it anyway
        person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
        capture_pageview: false, // We manually capture pageviews for Next.js routing
    })
}

function PostHogPageview() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname) {
            let url = window.origin + pathname;
            if (searchParams && searchParams.toString()) {
                url = url + `?${searchParams.toString()}`;
            }
            posthog.capture('$pageview', {
                '$current_url': url,
            });
        }
    }, [pathname, searchParams]);

    return null;
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
    return (
        <PostHogProvider client={posthog}>
            <Suspense fallback={null}>
                <PostHogPageview />
            </Suspense>
            {children}
        </PostHogProvider>
    );
}
