
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
    let score = 50;

    // 1. Gana Porutham (Temperament)
    const g1 = NAKSHATRA_GANAS[n1Idx];
    const g2 = NAKSHATRA_GANAS[n2Idx];

    if (g1 === g2) {
        score += 20; // Same temperament
    } else if ((g1 === 0 && g2 === 1) || (g1 === 1 && g2 === 0)) {
        score += 10; // Deva + Manushya is okay
    } else if (g1 === 2 || g2 === 2) {
        score -= 10; // Rakshasa clash potential
    }

    // 2. Rasi Element
    const e1 = RASHI_ELEMENTS[r1Idx];
    const e2 = RASHI_ELEMENTS[r2Idx];

    let dynamic = `${e1} & ${e2}`;

    if (e1 === e2) {
        score += 15; // Same element flows well
    } else if (
        (e1 === "Fire" && e2 === "Air") || (e1 === "Air" && e2 === "Fire") ||
        (e1 === "Water" && e2 === "Earth") || (e1 === "Earth" && e2 === "Water")
    ) {
        score += 15; // Complementary
    } else if (
        (e1 === "Fire" && e2 === "Water") || (e1 === "Water" && e2 === "Fire")
    ) {
        score -= 10; // Steam/Extinguish
    }

    // 3. Rajju (Star Distance check - Simplified)
    // Avoid same star group typically, but for Vibe Check we keep it positive.
    if (n1Idx === n2Idx) {
        score += 5; // Intense connection
    } else {
        const dist = Math.abs(n1Idx - n2Idx);
        if (dist === 13 || dist === 14) {
            score += 15; // Opposite attraction
        }
    }

    // Clamp Score
    score = Math.min(98, Math.max(30, score));

    // Generate Title & Desc
    let title = "";
    let desc = "";

    if (score > 80) {
        title = "Electric Connection ⚡";
        desc = "Your energies amplify each other. A rare and powerful resonance.";
    } else if (score > 60) {
        title = "Solid Harmony 🌿";
        desc = "Balanced and grounded. You understand each other's rhythms well.";
    } else if (score > 40) {
        title = "Spicy Friction 🌶️";
        desc = "Intense but volatile. High highs and confusing lows.";
    } else {
        title = "Karmic Lesson 🌪️";
        desc = "A challenging dynamic meant to teach you both patience and growth.";
    }

    return { score, title, description: desc, dynamic };
};
