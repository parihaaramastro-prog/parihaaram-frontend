"use client";

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const INACTIVITY_LIMIT_MS = 10 * 1000; // 10 seconds for testing

export default function SessionTimeout() {
    const router = useRouter();
    const [lastActivity, setLastActivity] = useState<number>(Date.now());
    const supabase = createClient();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Events to detect activity
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

        const resetTimer = () => {
            setLastActivity(Date.now());
        };

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Check for inactivity periodically
        const intervalId = setInterval(async () => {
            const now = Date.now();
            if (now - lastActivity > INACTIVITY_LIMIT_MS) {
                // Check if user is actually logged in before signing out
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    console.log("Session timed out due to inactivity.");
                    await supabase.auth.signOut();
                    router.push('/?timeout=true'); // Redirect to home with a flag
                }
            }
        }, 60000); // Check every minute

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
            clearInterval(intervalId);
        };
    }, [lastActivity, router, supabase]);

    return null; // This component handles logic only, no UI
}
