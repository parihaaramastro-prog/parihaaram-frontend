/**
 * Master Prompt Cache Service
 * Caches the master prompt on login to set the tone for all AI interactions
 */

let cachedMasterPrompt: string | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export const masterPromptCache = {
    /**
     * Get the cached master prompt
     */
    get(): string | null {
        // Check if cache is still valid
        if (cachedMasterPrompt && cacheTimestamp) {
            const now = Date.now();
            if (now - cacheTimestamp < CACHE_DURATION) {
                return cachedMasterPrompt;
            }
        }
        return null;
    },

    /**
     * Set the master prompt in cache
     */
    set(prompt: string): void {
        cachedMasterPrompt = prompt;
        cacheTimestamp = Date.now();
    },

    /**
     * Clear the cache
     */
    clear(): void {
        cachedMasterPrompt = null;
        cacheTimestamp = null;
    },

    /**
     * Check if cache is valid
     */
    isValid(): boolean {
        if (!cachedMasterPrompt || !cacheTimestamp) return false;
        const now = Date.now();
        return (now - cacheTimestamp) < CACHE_DURATION;
    }
};
