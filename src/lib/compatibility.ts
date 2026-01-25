
export interface CompatibilityResult {
    score: number;
    title: string;
    description: string;
    dynamic: string; // e.g., "Fire & Air"
}

// Simplified Nakshatra Groups (Ganas)
// 0 = Deva (Divine), 1 = Manushya (Human), 2 = Rakshasa (Demon)
const NAKSHATRA_GANAS: Record<number, number> = {
    0: 0, 1: 1, 2: 2, 3: 1, 4: 0, 5: 0, 6: 0, 7: 0, 8: 2,
    9: 2, 10: 1, 11: 1, 12: 0, 13: 2, 14: 0, 15: 0, 16: 0, 17: 2,
    18: 2, 19: 1, 20: 1, 21: 0, 22: 2, 23: 2, 24: 1, 25: 1, 26: 0
};

// Simplified Element Mapping for Rashis (0 to 11)
// 0=Fire, 1=Earth, 2=Air, 3=Water
const RASHI_ELEMENTS: Record<number, string> = {
    0: "Fire", 1: "Earth", 2: "Air", 3: "Water",
    4: "Fire", 5: "Earth", 6: "Air", 7: "Water",
    8: "Fire", 9: "Earth", 10: "Air", 11: "Water"
};

export const calculateVibe = (n1Idx: number, n2Idx: number, r1Idx: number, r2Idx: number): CompatibilityResult => {
    // NOTE: We now strictly use Moon Sign (Rashi) instead of Nakshatra (Star).
    // Reason: Nakshatra changes too fast (sensitive to birth time). Rashi is stable for ~2.5 days.

    let score = 50;

    // -----------------------------------------
    // 1. Elemental Chemistry (The Foundation)
    // -----------------------------------------
    const e1 = RASHI_ELEMENTS[r1Idx];
    const e2 = RASHI_ELEMENTS[r2Idx];

    let dynamic = `${e1} & ${e2}`;

    if (e1 === e2) {
        score += 20; // Same element = Deep Understanding
    } else if (
        (e1 === "Fire" && e2 === "Air") || (e1 === "Air" && e2 === "Fire") ||
        (e1 === "Water" && e2 === "Earth") || (e1 === "Earth" && e2 === "Water")
    ) {
        score += 25; // Complementary = Growth
    } else if (
        (e1 === "Fire" && e2 === "Water") || (e1 === "Water" && e2 === "Fire")
    ) {
        score -= 20; // Clash = Steam / Extinguish
    } else if (
        (e1 === "Air" && e2 === "Earth") || (e1 === "Earth" && e2 === "Air")
    ) {
        score -= 10; // Disconnect = Dust storm
    }

    // -----------------------------------------
    // 2. Lunar Geometry (The Angle)
    // -----------------------------------------
    // Calculate distance from R1 to R2 (0 to 11)
    const distance: number = (r2Idx - r1Idx + 12) % 12;

    // We interpret the "House" position of User 2 relative to User 1
    // 0 = Same Sign (1st)
    // 6 = Opposite Sign (7th) 

    switch (distance) {
        case 0: // Same Sign
            score += 20;
            break;
        case 6: // Opposite (7th) - Magnetic
            score += 30;
            break;
        case 4: // 5th (Trine) - Creativity/Romance
        case 8: // 9th (Trine) - Luck/Growth
            score += 25;
            break;
        case 2: // 3rd - Effort/Friends
        case 10: // 11th - Gains/Social
            score += 15;
            break;
        case 3: // 4th - Comfort/Square
        case 9: // 10th - Work/Square
            score += 5; // Good friction
            break;
        case 5: // 6th - Conflict/Service
        case 7: // 8th - Deep/Sudden/Transformative
            score -= 25; // The "Shashtashtaka" - Spicy/Hard
            break;
        case 1: // 2nd - Family/Assets
        case 11: // 12th - Loss/Bed pleasures/Exit
            score -= 5;
            break;
    }

    // Clamp Score
    score = Math.min(98, Math.max(12, score));

    // Generate Title & Desc based on Geometric Logic
    let title = "";
    let desc = "";

    if (score > 85) {
        title = "Electric Synergy ⚡";
        desc = "A rare, high-voltage alignment. You naturally amplify each other's strengths.";
    } else if (score > 70) {
        title = "Golden Flow ✨";
        desc = "Effortless understanding. Your emotional frequencies are perfectly tuned.";
    } else if (score > 50) {
        title = "Solid Bond 🌿";
        desc = "Balanced and workable. Requires some communication, but the foundation is strong.";
    } else if (score > 35) {
        title = "Spicy Friction 🌶️";
        desc = "Intense, passionate, but volatile. Great for short term, hard work for long term.";
    } else {
        title = "Karmic Lesson 🌪️";
        desc = "A challenging geometry designed to teach you patience, or to break patterns.";
    }

    return { score, title, description: desc, dynamic };
};
