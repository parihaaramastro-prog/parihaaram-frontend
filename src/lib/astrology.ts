export interface PlanetPosition {
    name: string;
    rashi: string;
    rashiTamil: string;
    rasi_idx: number;
    degrees: number;
    house: number;
}

export interface SookshmaDasha {
    planet: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
}

export interface Pratyantardasha {
    planet: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    sookshma_dashas: SookshmaDasha[];
}

export interface Bhukti {
    planet: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    pratyantardashas: Pratyantardasha[];
}

export interface Mahadasha {
    planet: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    bhuktis: Bhukti[];
}

export interface Prediction {
    title: string;
    content: string;
}

export interface NavamsaPlanet {
    planet: string;
    rasi_idx: number;
    sign: string;
    house: number;
}

export interface NavamsaChart {
    lagna: {
        rasi_idx: number;
        sign: string;
        house: number;
    };
    planets: NavamsaPlanet[];
}

export interface AstrologyResults {
    metadata: {
        type: string;
        system: string;
        ayanamsa: string;
        divisional_chart?: string;
        accuracy_note?: string;
        validation?: string;
        degree_precision?: string;
    };
    lagna: {
        idx: number;
        name: string;
        name_ta: string;
    };
    navamsa_chart?: NavamsaChart;
    moon_sign: {
        idx: number;
        name: string;
        name_ta: string;
    };
    nakshatra: {
        name: string;
        idx: number;
        padam: number;
    };
    planets: PlanetPosition[];
    mahadashas: Mahadasha[];
    predictions: Prediction[];
}

export const RASHIS_LIST = [
    { en: "Aries", ta: "மேஷம்" },
    { en: "Taurus", ta: "ரிஷபம்" },
    { en: "Gemini", ta: "மிதுனம்" },
    { en: "Cancer", ta: "கடகம்" },
    { en: "Leo", ta: "சிம்மம்" },
    { en: "Virgo", ta: "கன்னி" },
    { en: "Libra", ta: "துலாம்" },
    { en: "Scorpio", ta: "விருச்சிகம்" },
    { en: "Sagittarius", ta: "தனுசு" },
    { en: "Capricorn", ta: "மகரம்" },
    { en: "Aquarius", ta: "கும்பம்" },
    { en: "Meena", ta: "மீனம்" }
];

export const NAKSHATRAS_TAMIL = [
    "அஸ்வினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிடம்", "திருவாதிரை",
    "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்", "அஸ்தம்",
    "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை", "மூலம்", "பூராடம்",
    "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்", "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"
];

export async function getCoordinates(place: string) {
    if (!place) return { lat: 13.0827, lon: 80.2707 };
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`
        );
        const data = await response.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
    } catch (error) {
        console.error("Geocoding error:", error);
    }
    return { lat: 13.0827, lon: 80.2707 };
}
