
export interface DetailedPrediction {
    title: string;
    overview: string;
    career: {
        summary: string;
        details: string;
        rating: number; // 1-5
    };
    love: {
        summary: string;
        details: string;
        rating: number;
    };
    finance: {
        summary: string;
        details: string;
        rating: number;
    };
    health: {
        summary: string;
        details: string;
        rating: number;
    };
    quarters: {
        q1: string;
        q2: string;
        q3: string;
        q4: string;
    };
    remedies: string[];
}

export const RASHI_PREDICTIONS: Record<string, DetailedPrediction> = {
    Aries: {
        title: "Aries 2026 Rashi Phal",
        overview: "2026 is a milestone year for Aries (Mesha Rashi). With Saturn's substantial influence in your house of gains and Jupiter's blessing in the latter half, you are poised for significant structural changes in your life. The focus shifts from impulsive actions to calculated, long-term strategies.",
        career: {
            summary: "Growth through discipline.",
            details: "The year starts with high workload. Saturn demands proof of your skills. Post-May, as Jupiter transits specifically favorably, promotions or successful job switches are highly indicated. Entrepreneurs will find stability after Q2.",
            rating: 4,
        },
        love: {
            summary: "Commitment is key.",
            details: "Relationships require patience. If you are single, Q3 brings a very strong chance of meeting a long-term partner. Existing relationships might face a test of maturity in Q1 but will emerge stronger.",
            rating: 3,
        },
        finance: {
            summary: "Accumulation of wealth.",
            details: "While expenses might spike related to travel or home renovation in Q2, overall savings will increase. Investments in land or long-term bonds are favored.",
            rating: 4,
        },
        health: {
            summary: "Manage stress proactively.",
            details: "Headaches or migraines might bother you due to stress. Incorporate regular cardio or yoga. Watch your blood pressure.",
            rating: 3,
        },
        quarters: {
            q1: "Focus on clearing backlogs. Heavy workload.",
            q2: "Financial planning and potential travel.",
            q3: "Relationship bloom and career hikes.",
            q4: "Spiritual growth and peaceful closure to year.",
        },
        remedies: [
            "Light a sesame oil lamp on Saturdays.",
            "Donate red lentils on Tuesdays.",
            "Practice meditation daily for 10 minutes."
        ]
    },
    Taurus: {
        title: "Taurus 2026 Rashi Phal",
        overview: "Stability is your forte, and 2026 reinforces it. Rishaba Rashi natives will find deep satisfaction in domestic harmony and career consolidation. While growth might seem slow initially, it is rock solid.",
        career: {
            summary: "Consolidation and recognition.",
            details: "Not a year for risky job hops. Stick to your current path; recognition comes in Q3. Artists and creative professionals will have a golden period in late 2026.",
            rating: 4,
        },
        love: {
            summary: "Blissful harmony.",
            details: "One of the best years for love. Marital discord, if any, dissolves. Singles have high chances of marriage.",
            rating: 5,
        },
        finance: {
            summary: "Steady inflow.",
            details: "No major windfalls, but no losses either. Consistent income allows for luxury purchases, possibly a vehicle.",
            rating: 4,
        },
        health: {
            summary: "Watch your diet.",
            details: "Throat and sugar-related issues could crop up. Avoid indulgent eating habits.",
            rating: 3,
        },
        quarters: {
            q1: "Social gatherings and family time.",
            q2: "Work pressure builds up slightly.",
            q3: "Recognition and rewards at workplace.",
            q4: "Relaxation and luxury travel.",
        },
        remedies: [
            "Offer white flowers to goddess Lakshmi on Fridays.",
            "Feed cows whenever possible.",
            "Avoid wearing dark blue clothes for important events."
        ]
    },
    Gemini: {
        title: "Gemini 2026 Rashi Phal",
        overview: "A dynamic year for Mithuna Rashi. Your dual nature will be an asset as adaptability becomes crucial. Opportunities will come from foreign lands or through digital networks.",
        career: {
            summary: "Expansion and networking.",
            details: "Great year for media, marketing, and tech professionals. Networking leads to unexpected opportunities. A transfer or relocation is possible in Q3.",
            rating: 5,
        },
        love: {
            summary: "Excitement but misunderstandings.",
            details: "Fun-filled year for dating, but communication gaps might cause minor tiffs in serious relationships. Be clear with your words.",
            rating: 3,
        },
        finance: {
            summary: "Fluctuating but sufficient.",
            details: "Money comes in chunks. Good for freelancers. Be wary of lending money to friends.",
            rating: 3,
        },
        health: {
            summary: "Nervous energy.",
            details: "Anxiety might be an issue. Respiratory health needs care during change of seasons.",
            rating: 3,
        },
        quarters: {
            q1: "New connections and ideas.",
            q2: "Travel and learning.",
            q3: "Career peak and financial gain.",
            q4: "Introspection and planning.",
        },
        remedies: [
            "Donate green moong dal on Wednesdays.",
            "Chant Vishnu Sahasranamam.",
            "Keep a small green plant on your desk."
        ]
    },
    Cancer: {
        title: "Cancer 2026 Rashi Phal",
        overview: "2026 is a year of emotional and spiritual renewal for Kataka Rashi. You may feel a strong pull towards your roots, home, and inner self. Career takes a backseat to personal satisfaction.",
        career: {
            summary: "Steady but not spectacular.",
            details: "Work will be routine. It serves as a means to an end. Good year for those in real estate, intense research, or psychology.",
            rating: 3,
        },
        love: {
            summary: "Deep emotional bonding.",
            details: "You will crave depth. Superficial dating won't interest you. Existing bonds deepen significantly.",
            rating: 4,
        },
        finance: {
            summary: "Gains from assets.",
            details: "Inheritance or gains from property are indicated. Avoid stock market speculation.",
            rating: 4,
        },
        health: {
            summary: "Gut instinct and health.",
            details: "Digestive sensitivity is high. Eat home-cooked meals. Emotional stress directly impacts your stomach.",
            rating: 2,
        },
        quarters: {
            q1: "Focus on home and mother.",
            q2: "Financial gains from property.",
            q3: "Spiritual journeys.",
            q4: "Career stability returns.",
        },
        remedies: [
            "Offer milk to Shiva Lingam on Mondays.",
            "Respect elders and seek their blessings.",
            "Wear a pearl or silver ring (consult astrologer)."
        ]
    },
    Leo: {
        title: "Leo 2026 Rashi Phal",
        overview: "The spotlight returns to Simha Rashi. After a period of lurking in the shadows, 2026 brings you back to center stage. Leadership, fame, and ego battles are the themes.",
        career: {
            summary: "Leadership and authority.",
            details: "Promotions are very likely. You will be given charge of important teams. Politicians and leaders will have a sway.",
            rating: 5,
        },
        love: {
            summary: "Passionate but egoistic.",
            details: "Romance is high, but so are arguments. Keep your ego in check to maintain harmony.",
            rating: 3,
        },
        finance: {
            summary: "High income, high expense.",
            details: "Money flows in, but you spend it on maintaining your status. Luxury cars or watches might be purchased.",
            rating: 4,
        },
        health: {
            summary: "Heart and spine.",
            details: "Good overall vitality, but watch out for back issues. maintain a good posture.",
            rating: 4,
        },
        quarters: {
            q1: "Professional recognition.",
            q2: "Social circle expansion.",
            q3: "Travel for leisure.",
            q4: "Conflicts with authority figures.",
        },
        remedies: [
            "Offer water to the Sun at sunrise.",
            "Chant Aditya Hridayam.",
            "Donate wheat or copper on Sundays."
        ]
    },
    Virgo: {
        title: "Virgo 2026 Rashi Phal",
        overview: "Kanni Rashi will have a year of hard work and tangible results. 'Service' is your motto this year. You will find joy in organising your life and helping others.",
        career: {
            summary: "Excellence in execution.",
            details: "Your eye for detail will be rewarded. Good year for lawyers, accountants, and doctors. Work pressure will be high but manageable.",
            rating: 4,
        },
        love: {
            summary: "Practical partnerships.",
            details: "Love is expressed through acts of service. Partners will appreciate your helpful nature.",
            rating: 3,
        },
        finance: {
            summary: "Calculated growth.",
            details: "Debts will be cleared. Savings plan will be executed perfectly. Safe investments are best.",
            rating: 4,
        },
        health: {
            summary: "Nervous exhaustion.",
            details: "You might overthink and stress yourself out. Insomnia could be a minor issue.",
            rating: 3,
        },
        quarters: {
            q1: "Health improvements.",
            q2: "Success in competitive exams/projects.",
            q3: "Financial consolidation.",
            q4: "Family gatherings.",
        },
        remedies: [
            "Feed green fodder to cows.",
            "Support education for underprivileged children.",
            "Chant Ganesha mantras."
        ]
    },
    Libra: {
        title: "Libra 2026 Rashi Phal",
        overview: "Thula Rashi seeks balance, and 2026 offers it after some initial wobbles. Relationships and partnerships are the core focus area. Creative self-expression flourishes.",
        career: {
            summary: "Partnerships thrive.",
            details: "Business partnerships are highly favored. Avoid going it alone. Diplomacy wins you big contracts.",
            rating: 4,
        },
        love: {
            summary: "Romance blooms.",
            details: "Single Libras might get married. Married life sees a second honeymoon phase.",
            rating: 5,
        },
        finance: {
            summary: "Balanced books.",
            details: "Expenditure on beauty, art, and clothes increases. Income is steady.",
            rating: 3,
        },
        health: {
            summary: "Kidney and skin care.",
            details: "Drink plenty of water. Skin allergies might flare up in Q2.",
            rating: 3,
        },
        quarters: {
            q1: "Creative burst.",
            q2: "Relationship focus.",
            q3: "Business expansion.",
            q4: "Home renovation.",
        },
        remedies: [
            "Donate white clothes or perfume.",
            "Worship Goddess Durga.",
            "Keep your surroundings clutter-free."
        ]
    },
    Scorpio: {
        title: "Scorpio 2026 Rashi Phal",
        overview: "Vrischika Rashi enters a transformative phase. This is a year of shedding old skins. Deep psychological insights and potential inheritance or sudden gains are indicated.",
        career: {
            summary: "Hidden power.",
            details: "You operate best behind the scenes. Research, occult, and mining sectors favor you. Office politics might be intense.",
            rating: 3,
        },
        love: {
            summary: " intense and possessive.",
            details: "Deep connections, but jealousy could be an issue. Transformations in relationship status are likely.",
            rating: 3,
        },
        finance: {
            summary: "Unexpected windfalls.",
            details: "Insurance money, tax refunds, or inheritance could boost finances. Avoid impulsive gambling.",
            rating: 4,
        },
        health: {
            summary: "Detoxification needed.",
            details: "Reproductive health needs care. Good time for a deeper cleanse or detox retreat.",
            rating: 2,
        },
        quarters: {
            q1: "Family disputes resolved.",
            q2: "Career changes.",
            q3: "Financial gain.",
            q4: "Spiritual breakthrough.",
        },
        remedies: [
            "Donate blood if health permits.",
            "Worship Lord Subramanya (Murugan).",
            "Chant Hanuman Chalisa."
        ]
    },
    Sagittarius: {
        title: "Sagittarius 2026 Rashi Phal",
        overview: "Dhanu Rashi sees horizons expanding. 2026 is about learning, travel, and teaching. Optimism returns after a period of dullness.",
        career: {
            summary: "Teaching and Travel.",
            details: "Great for professors, mentors, and travel agents. You might publish a paper or book.",
            rating: 5,
        },
        love: {
            summary: "Freedom in love.",
            details: "You need a partner who understands your need for space. Long distance relationships work well this year.",
            rating: 4,
        },
        finance: {
            summary: "Luck favors the bold.",
            details: "Investments in foreign assets or education pay off. Generally a lucky year for money.",
            rating: 4,
        },
        health: {
            summary: "Thighs and Liver.",
            details: "Watch your weight. Liver can be sensitive to fatty foods.",
            rating: 3,
        },
        quarters: {
            q1: "Short travels.",
            q2: "Home improvements.",
            q3: "Creative projects.",
            q4: "Long spiritual journey.",
        },
        remedies: [
            "Donate yellow items (dal, clothes) on Thursdays.",
            "Visit temples regularly.",
            "Respect teachers and gurus."
        ]
    },
    Capricorn: {
        title: "Capricorn 2026 Rashi Phal",
        overview: "Makara Rashi is in a power year. Your ruling planet Saturn rewards your past hard work. Career is the absolute focus, and you climb the ladder of success.",
        career: {
            summary: "Peak performance.",
            details: "Promotions, power, and prestige. You are unstoppable. Work load is heavy but you enjoy it.",
            rating: 5,
        },
        love: {
            summary: "Practical love.",
            details: "Dryness in romance. You might be 'married to your work'. Make consciously effort to spend time with family.",
            rating: 2,
        },
        finance: {
            summary: "Solid assets.",
            details: "Investment in machinery, land, or long-term stocks. Very stable financial year.",
            rating: 5,
        },
        health: {
            summary: "Joints and knees.",
            details: "Knee pain or arthritis could flair up. Calcium intake is important.",
            rating: 3,
        },
        quarters: {
            q1: "Heavy work pressure.",
            q2: "Financial consolidation.",
            q3: "New business ventures.",
            q4: "Recognition and awards.",
        },
        remedies: [
            "Help the elderly or disabled.",
            "Light a lamp under a Peepal tree on Saturdays.",
            "Chant Shani Mantra."
        ]
    },
    Aquarius: {
        title: "Aquarius 2026 Rashi Phal",
        overview: "Kumba Rashi focuses on self-discovery and innovation. You are reinventing yourself. Conventional paths will not appeal to you in 2026.",
        career: {
            summary: "Innovation and Tech.",
            details: "Startups, tech, and NGOs are favorable. You might quit a 9-5 job to start something unique.",
            rating: 4,
        },
        love: {
            summary: "Friendship first.",
            details: "Love blooms from friendship. Unconventional relationships. You value intellectual connection over emotion.",
            rating: 3,
        },
        finance: {
            summary: "Unpredictable but sufficient.",
            details: "Money comes from unexpected sources. Gains from large networks or social media.",
            rating: 3,
        },
        health: {
            summary: "Circulation issues.",
            details: "Varicose veins or ankle issues possible. Keep moving.",
            rating: 3,
        },
        quarters: {
            q1: "Self-identity crisis/transformation.",
            q2: "Financial gains.",
            q3: "Short travels.",
            q4: "Career shift.",
        },
        remedies: [
            "Donate iron or black items.",
            "Service to society/volunteering.",
            "Worship Lord Shiva."
        ]
    },
    Pisces: {
        title: "Pisces 2026 Rashi Phal",
        overview: "Meena Rashi enters a spiritual and dreamy phase. The material world feels distant. Great year for artists, healers, and spiritual seekers.",
        career: {
            summary: "Creative flow.",
            details: "Arts, music, yoga, and healing professions see great success. Corporate jobs might feel suffocating.",
            rating: 3,
        },
        love: {
            summary: "Dreamy romance.",
            details: "You tend to idealize partners. Be careful of illusions. Spiritual connection is strong.",
            rating: 4,
        },
        finance: {
            summary: "Spending on charity.",
            details: "You might donate a lot or spend on pilgrimages. Money flows out as easily as it flows in.",
            rating: 2,
        },
        health: {
            summary: "Feet and sleep.",
            details: "Foot issues or sleep disorders. Meditation is the best cure.",
            rating: 3,
        },
        quarters: {
            q1: "Expenditure and travel.",
            q2: "Self-focus and vitality.",
            q3: "Financial recovery.",
            q4: "Career changes.",
        },
        remedies: [
            "Feed fish.",
            "Donate yellow clothes to priests.",
            "Visit holy rivers or water bodies."
        ]
    }
};

export const RASHI_PREDICTIONS_TA: Record<string, DetailedPrediction> = {
    Aries: {
        title: "மேஷம் 2026 ராசி பலன்",
        overview: "2026 ஆம் ஆண்டு மேஷ ராசிக்காரர்களுக்கு ஒரு முக்கியமான மாற்றத்தை குறிக்கும் ஆண்டாகும். சனியின் தாக்கம் மற்றும் குருவின் அருள் ஆகியவற்றுடன், உங்கள் வாழ்வில் நீண்ட கால திட்டங்களில் கவனம் செலுத்துவதற்கான நேரம் இது.",
        career: {
            summary: "கடின உழைப்பால் உயர்வு",
            details: "ஆண்டின் தொடக்கம் அதிக பணிச்சுமையுடன் இருக்கும். மே மாதத்திற்குப் பிறகு, பதவி உயர்வு அல்லது புதிய வேலை வாய்ப்புகள் கிடைக்கும். தொழில்முனைவோருக்கு இரண்டாம் காலாண்டிற்குப் பிறகு ஸ்திரத்தன்மை ஏற்படும்.",
            rating: 4,
        },
        love: {
            summary: "உறவில் முதிர்ச்சி தேவை",
            details: "உறவுகளில் பொறுமை தேவை. திருமணமாகாதவர்களுக்கு, ஆண்டின் பிற்பகுதியில் நல்ல வரன் அமைய வாய்ப்புள்ளது.",
            rating: 3,
        },
        finance: {
            summary: "செல்வச் சேமிப்பு உயரும்",
            details: "பயணம் அல்லது வீடு புதுப்பித்தல் செலவுகள் இருந்தாலும், சேமிப்பு அதிகரிக்கும். நிலம் அல்லது நீண்ட கால முதலீடுகளில் கவனம் செலுத்துவது நல்லது.",
            rating: 4,
        },
        health: {
            summary: "மன அழுத்தத்தை குறையுங்கள்",
            details: "மன அழுத்தம் காரணமாக தலைவலி ஏற்படலாம். யோகா மற்றும் தியானம் செய்வது நன்மை தரும்.",
            rating: 3,
        },
        quarters: {
            q1: "பணிச்சுமை அதிகம்.",
            q2: "நிதித் திட்டமிடல் மற்றும் பயணம்.",
            q3: "உறவுகள் மேம்படும், தொழில் உயர்வு.",
            q4: "ஆன்மீக சிந்தனை மற்றும் அமைதி.",
        },
        remedies: [
            "சனிக்கிழமைகளில் நல்லெண்ணெய் தீபம் ஏற்றவும்.",
            "செவ்வாய்க்கிழமைகளில் துவரம் பருப்பு தானம் செய்யவும்.",
            "தினமும் 10 நிமிடங்கள் தியானம் செய்யவும்."
        ]
    },
    Taurus: {
        title: "ரிஷபம் 2026 ராசி பலன்",
        overview: "2026 ரிஷப ராசிக்கு நிலைத்தன்மையையும் வளர்ச்சியையும் தரும். குடும்ப மகிழ்ச்சி மற்றும் தொழில் முன்னேற்றம் மனநிறைவைத் தரும்.",
        career: {
            summary: "தொழில் ஸ்திரத்தன்மை",
            details: "வேலை மாற்றம் செய்ய இது ஏற்ற நேரமல்ல. இருக்கும் வேலையில் கவனம் செலுத்துங்கள். மூன்றாம் காலாண்டில் அங்கீகாரம் கிடைக்கும்.",
            rating: 4,
        },
        love: {
            summary: "மகிழ்ச்சியான உறவு",
            details: "காதல் மற்றும் திருமண வாழ்வு சிறப்பாக இருக்கும். திருமண தடைகள் நீங்கும்.",
            rating: 5,
        },
        finance: {
            summary: "சீலான வருமானம்",
            details: "பெரிய லாபம் இல்லாவிட்டாலும், நஷ்டம் இருக்காது. வாகனம் வாங்கும் யோகம் உண்டு.",
            rating: 4,
        },
        health: {
            summary: "உணவில் கவனம் தேவை",
            details: "தொண்டை மற்றும் சர்க்கரை தொடர்பான பிரச்சனைகள் வரலாம். ஆரோக்கியமான உணவை உட்கொள்ளவும்.",
            rating: 3,
        },
        quarters: {
            q1: "குடும்ப விழாக்கள்.",
            q2: "சிறிய பணி அழுத்தம்.",
            q3: "பணியிடத்தில் பாராட்டு.",
            q4: "ஓய்வு மற்றும் சுற்றுலா.",
        },
        remedies: [
            "வெள்ளிக்கிழமைகளில் மகாலட்சுமி வழிபாடு செய்யவும்.",
            "பசுவிற்கு உணவு அளிக்கவும்.",
            "நீல நிற ஆடைகளைத் தவிர்க்கவும்."
        ]
    },
    // Adding placeholder for others to save complexity for demo. In production, need full translations.
    Gemini: {
        title: "மிதுனம் 2026 ராசி பலன்",
        overview: "மிதுன ராசிக்கு இது ஒரு மாறுபட்ட மற்றும் சுவாரஸ்யமான ஆண்டு. உங்கள் தகவமைப்புத் திறன் உங்களுக்கு வெற்றியைத் தேடித்தரும். வெளிநாட்டு வாய்ப்புகள் மற்றும் புதிய தொடர்புகள் ஏற்படும்.",
        career: {
            summary: "விரிவாக்கம் மற்றும் நெட்வொர்க்கிங்",
            details: "ஊடகம் மற்றும் தொழில்நுட்பத் துறையினருக்கு ஏற்ற ஆண்டு. நெட்வொர்க்கிங் மூலம் புதிய வாய்ப்புகள் கிடைக்கும்.",
            rating: 5
        },
        finance: {
            summary: "போதுமான வருமானம்",
            details: "வருமானம் சீராக இருக்கும். நண்பர்களுக்கு கடன் கொடுப்பதைத் தவிர்க்கவும்.",
            rating: 3
        },
        love: {
            summary: "காதலில் உற்சாகம்",
            details: "காதல் வாழ்க்கை மகிழ்ச்சியாக இருக்கும், ஆனால் பேச்சில் கவனம் தேவை.",
            rating: 3
        },
        health: {
            summary: "பதற்றத்தைத் தவிர்க்கவும்",
            details: "சுவாசப் பிரச்சனைகள் மற்றும் பதற்றம் ஏற்பட வாய்ப்புள்ளது.",
            rating: 3
        },
        quarters: {
            q1: "புதிய நண்பர்கள் மற்றும் யோசனைகள்.",
            q2: "பயணம் மற்றும் கற்றல்.",
            q3: "தொழில் வளர்ச்சி.",
            q4: "திட்டமிடல்.",
        },
        remedies: ["புதன்கிழமை பச்சை பயறு தானம் செய்யவும்.", "விஷ்ணு சகஸ்ரநாமம் சொல்லவும்."]
    },
    Cancer: {
        title: "கடகம் 2026 ராசி பலன்",
        overview: "2026 ஆம் ஆண்டு கடக ராசிக்கு உணர்வுபூர்வமான மற்றும் ஆன்மீக ஆண்டாக இருக்கும். தொழில் வாழ்க்கையை விட தனிப்பட்ட மகிழ்ச்சிக்கு முக்கியத்துவம் கொடுப்பீர்கள்.",
        career: { summary: "சீரான வளர்ச்சி", details: "வேலை வழக்கம்போல இருக்கும். ரியல் எஸ்டேட் துறையினருக்கு நல்லது.", rating: 3 },
        love: { summary: "ஆழமான உறவுகள்", details: "உறவுகள் வலுப்படும். குடும்பத்துடன் அதிக நேரம் செலவிடுவீர்கள்.", rating: 4 },
        finance: { summary: "சொத்து மூலம் லாபம்", details: "பரம்பரை சொத்து அல்லது நிலம் மூலம் லாபம் கிடைக்கும்.", rating: 4 },
        health: { summary: "வயிறு சம்மந்தப்பட்ட பிரச்சனைகள்", details: "உணவு பழக்கவழக்கங்களில் கவனம் தேவை.", rating: 2 },
        quarters: { q1: "குடும்பத்தில் கவனம்.", q2: "சொத்து லாபம்.", q3: "ஆன்மீக பயணம்.", q4: "தொழில் ஸ்திரத்தன்மை." },
        remedies: ["திங்கள் கிழமை சிவ வழிபாடு.", "பெரியவர்களை மதித்து ஆசி பெறவும்."]
    },
    Leo: {
        title: "சிம்மம் 2026 ராசி பலன்",
        overview: "சிம்ம ராசிக்கு இது தலைமைத்துவத்தை வெளிப்படுத்தும் ஆண்டு. புகழ் மற்றும் அங்கீகாரம் உங்களைத் தேடி வரும்.",
        career: { summary: "பதவி உயர்வு", details: "உங்கள் தலைமைப் பண்பு பாராட்டப்படும். பதவி உயர்வு கிடைக்க வாய்ப்புள்ளது.", rating: 5 },
        love: { summary: "ஈகோ பிரச்சனைகள்", details: "காதல் சிறப்பாக இருந்தாலும், ஈகோ காரணமாக சிறு சண்டைகள் வரலாம்.", rating: 3 },
        finance: { summary: "அதிக வரவு, அதிக செலவு", details: "வருமானம் உயரும், அதே அளவு ஆடம்பரச் செலவுகளும் இருக்கும்.", rating: 4 },
        health: { summary: "முதுகு வலி கவனம்", details: "இதயம் மற்றும் முதுகு தண்டுவட நலனில் அக்கறை தேவை.", rating: 4 },
        quarters: { q1: "தொழில் அங்கீகாரம்.", q2: "நட்பு வட்டம் விரிவடையும்.", q3: "சுற்றுலா.", q4: "அதிகாரிகளுடன் கருத்து வேறுபாடு." },
        remedies: ["சூரிய நமஸ்காரம் செய்யவும்.", "ஆதித்ய ஹிருதயம் சொல்லவும்."]
    },
    Virgo: {
        title: "கன்னி 2026 ராசி பலன்",
        overview: "கன்னி ராசிக்கு கடின உழைப்பு மற்றும் சேவை மனப்பான்மைக்குரிய ஆண்டு. உங்கள் திட்டமிடல் வெற்றி பெறும்.",
        career: { summary: "துல்லியமான செயல்பாடு", details: "உங்கள் உழைப்புக்கு ஏற்ற பலன் கிடைக்கும். வழக்கறிஞர்கள் மற்றும் மருத்துவர்களுக்கு நல்லது.", rating: 4 },
        love: { summary: "நடைமுறை வாழ்க்கை", details: "உறவில் புரிதல் இருக்கும். துணைவரின் ஆதரவு கிடைக்கும்.", rating: 3 },
        finance: { summary: "கடன் நிவர்த்தி", details: "கடன்கள் அடையும். சேமிப்பு உயரும்.", rating: 4 },
        health: { summary: "சோர்வு", details: "அதிக வேலைப்பளு சோர்வை ஏற்படுத்தலாம். தூக்கத்தில் கவனம் தேவை.", rating: 3 },
        quarters: { q1: "உடல்நலம் மேம்படும்.", q2: "போட்டிகளில் வெற்றி.", q3: "நிதி ஸ்திரத்தன்மை.", q4: "குடும்ப சந்திப்புகள்." },
        remedies: ["பசுவிற்கு அகத்திக்கீரை கொடுக்கவும்.", "விநாயகர் வழிபாடு செய்யவும்."]
    },
    Libra: {
        title: "துலாம் 2026 ராசி பலன்",
        overview: "துலாம் ராசிக்கு சமநிலை மற்றும் நல்லிணக்கம் நிறைந்த ஆண்டு. உறவுகள் மற்றும் கூட்டுத் தொழில் சிறப்பாக இருக்கும்.",
        career: { summary: "கூட்டுத் தொழில் சிறப்பு", details: "வியாபார கூட்டாண்மை வெற்றி தரும். இராஜதந்திரத்தால் வெல்வீர்கள்.", rating: 4 },
        love: { summary: "காதல் மலரும்", details: "திருமணம் ஆகாதவர்களுக்கு டும் டும் டும். தம்பதிகளுக்கு அன்யோன்யம் அதிகரிக்கும்.", rating: 5 },
        finance: { summary: "சீரான நிதிநிலை", details: "அழகு மற்றும் ஆடம்பர பொருட்களுக்கு செலவு செய்வீர்கள்.", rating: 3 },
        health: { summary: "சரும பாதுகாப்பு", details: "நீர் அதிகம் அருந்தவும். சரும அலர்ஜி வரலாம்.", rating: 3 },
        quarters: { q1: "படைப்பாற்றல்.", q2: "உறவுகளில் மகிழ்ச்சி.", q3: "வியாபார வளர்ச்சி.", q4: "வீடு புதுப்பித்தல்." },
        remedies: ["வெள்ளை நிற ஆடை அணியவும்.", "துர்க்கை வழிபாடு செய்யவும்."]
    },
    Scorpio: {
        title: "விருச்சிகம் 2026 ராசி பலன்",
        overview: "விருச்சிக ராசிக்கு இது மாற்றங்கள் நிறைந்த ஆண்டு. பழைய பிரச்சனைகள் நீங்கி புதிய பாதை கிடைக்கும்.",
        career: { summary: "மறைமுக எதிர்ப்புகள்", details: "ஆராய்ச்சித் துறையினருக்கு ஏற்றது. அலுவலக அரசியலில் கவனம் தேவை.", rating: 3 },
        love: { summary: "தீவிரமான அன்பு", details: "உறவில் ஆழம் இருக்கும், ஆனால் பொசசிவ்னஸ் தவிர்க்கவும்.", rating: 3 },
        finance: { summary: "திடீர் அதிர்ஷ்டம்", details: "காப்பீடு அல்லது பரம்பரை சொத்து மூலம் பணம் வரலாம்.", rating: 4 },
        health: { summary: "நச்சு நீக்கம் தேவை", details: "உடலை சுத்தமாக வைத்துக்கொள்வது அவசியம்.", rating: 2 },
        quarters: { q1: "குடும்பப் பிரச்சனை தீரும்.", q2: "வேலை மாற்றம்.", q3: "நிதி லாபம்.", q4: "ஆன்மீக சிந்தனை." },
        remedies: ["ரத்த தானம் செய்யவும்.", "முருகன் வழிபாடு செய்யவும்."]
    },
    Sagittarius: {
        title: "தனுசு 2026 ராசி பலன்",
        overview: "தனுசு ராசிக்கு புதிய எல்லைகளைத் தொடும் ஆண்டு. பயணம் மற்றும் கற்றல் உங்களுக்கு மகிழ்ச்சி தரும்.",
        career: { summary: "கல்வி மற்றும் பயணம்", details: "ஆசிரியர்கள் மற்றும் பயணத் துறையினருக்கு பொற்காலம்.", rating: 5 },
        love: { summary: "சுதந்திரம் தேவை", details: "துணையுடன் பயணம் செல்வீர்கள். தொலைதூர உறவுகள் வலுபெறும்.", rating: 4 },
        finance: { summary: "அதிர்ஷ்டம் துணை நிற்கும்", details: "வெளிநாட்டு முதலீடுகள் லாபம் தரும்.", rating: 4 },
        health: { summary: "கல்லீரல் கவனம்", details: "உடல் எடை கூடும், உணவில் கட்டுப்பாடு தேவை.", rating: 3 },
        quarters: { q1: "சிறிய பயணம்.", q2: "வீட்டு வசதிகள்.", q3: "புதிய திட்டங்கள்.", q4: "ஆன்மீக யாத்திரை." },
        remedies: ["வியாழக்கிழமை மஞ்சள் நிற பொருள் தானம்.", "குரு வழிபாடு."]
    },
    Capricorn: {
        title: "மகரம் 2026 ராசி பலன்",
        overview: "மகர ராசிக்கு இது அதிகாரத்தையும் வெற்றியையும் தரும் ஆண்டு. கடின உழைப்புக்கான பலன் கிடைக்கும்.",
        career: { summary: "உச்சம் தொடுவீர்கள்", details: "பதவி உயர்வு, அதிகாரம் கிடைக்கும். வேலைப்பளு அதிகம் இருக்கும்.", rating: 5 },
        love: { summary: "நடைமுறை அன்பு", details: "வேலையில் மூழ்கி குடும்பத்தை மறக்க வேண்டாம்.", rating: 2 },
        finance: { summary: "சொத்து சேர்க்கை", details: "நிலம், இயந்திரங்கள் வாங்குவீர்கள். நிதிநிலை மிகவும் ஸ்ட்ராங்.", rating: 5 },
        health: { summary: "மூட்டு வலி", details: "கால் மற்றும் மூட்டு வலிகள் வரலாம்.", rating: 3 },
        quarters: { q1: "வேலைப்பளு.", q2: "நிதி சேமிப்பு.", q3: "புதிய தொழில்.", q4: "விருதுகள் மற்றும் அங்கீகாரம்." },
        remedies: ["சனிக்கிழமை எள் தீபம்.", "முதியவர்களுக்கு உதவி செய்யவும்."]
    },
    Aquarius: {
        title: "கும்பம் 2026 ராசி பலன்",
        overview: "கும்ப ராசிக்கு புதிய கண்டுபிடிப்புகள் மற்றும் சுய மாறுதலுக்கான ஆண்டு. வழக்கமான பாதையில் செல்ல மாட்டீர்கள்.",
        career: { summary: "புதுமை மற்றும் தொழில்நுட்பம்", details: "ஸ்டார்ட்அப் மற்றும் டெக் துறையினருக்கு ஏற்றது.", rating: 4 },
        love: { summary: "நட்பே காதல்", details: "நண்பர்கள் காதலர்களாக மாறலாம். வித்தியாசமான உறவுகள் அமையும்.", rating: 3 },
        finance: { summary: "எதிர்பாராத வரவு", details: "சமூக வலைத்தளங்கள் மூலம் வருமானம் வரலாம்.", rating: 3 },
        health: { summary: "ரத்த ஓட்டம்", details: "கால் வலி மற்றும் நரம்பு பிரச்சனைகள் வரலாம்.", rating: 3 },
        quarters: { q1: "சுய மாற்றம்.", q2: "நிதி வரவு.", q3: "சிறிய பயணம்.", q4: "வேலை மாற்றம்." },
        remedies: ["சிவ வழிபாடு.", "தொண்டு நிறுவனங்களுக்கு உதவவும்."]
    },
    Pisces: {
        title: "மீனம் 2026 ராசி பலன்",
        overview: "மீன ராசிக்கு ஆன்மீக மற்றும் கனவு உலகம் சார்ந்த ஆண்டு. கலைத்துறையினருக்கு ஏற்றது.",
        career: { summary: "படைப்பாற்றல்", details: "கலை, இசை மற்றும் ஆன்மீகத் துறையில் உள்ளவர்களுக்கு வெற்றி.", rating: 3 },
        love: { summary: "கனவுத் துணை", details: "ரொமான்ஸ் சிறப்பாக இருக்கும். ஆனால் கனவு உலகில் வாழாதீர்கள்.", rating: 4 },
        finance: { summary: "தான தர்மம்", details: "அதிக செலவுகள் இருக்கும், குறிப்பாக ஆன்மீக காரியங்களுக்கு.", rating: 2 },
        health: { summary: "பாதங்கள் கவனம்", details: "தூக்கமின்மை மற்றும் கால் வலி வரலாம். தியானம் அவசியம்.", rating: 3 },
        quarters: { q1: "செலவுகள் அதிகரிக்கும்.", q2: "உடல்நலம் மேம்படும்.", q3: "பணம் வரும்.", q4: "தொழில் மாற்றம்." },
        remedies: ["மீன்களுக்கு பொரி போடவும்.", "மஞ்சள் ஆடை தானம் செய்யவும்."]
    }
};

export const LAGNA_PREDICTIONS: Record<string, DetailedPrediction> = {
    // For simplicity in this demo, Lagna predictions often follow a similar thematic structure but affect the 'Self' (Body/Path) more directly than the 'Mind' (Moon).
    // I will auto-generate slight variations for Lagna to differentiation.
    ...Object.fromEntries(
        Object.entries(RASHI_PREDICTIONS).map(([key, val]) => [
            key,
            {
                ...val,
                title: `${key} Lagna (Ascendant) 2026 Predictions`,
                overview: `For ${key} Lagna, 2026 is critical for physical vitality and life path direction. ${val.overview.replace('Rashi', 'Lagna')}`,
                health: {
                    ...val.health,
                    summary: "Physical Vitality Focus: " + val.health.summary
                }
            }
        ])
    )
};

export const LAGNA_PREDICTIONS_TA: Record<string, DetailedPrediction> = {
    ...Object.fromEntries(
        Object.entries(RASHI_PREDICTIONS_TA).map(([key, val]) => [
            key,
            {
                ...val,
                title: `${val.title.split(' ')[0]} லக்னம் 2026 பலன்கள்`,
                overview: `${val.title.split(' ')[0]} லக்னத்திற்கு, 2026 உடல் ஆரோக்கியம் மற்றும் வாழ்க்கைப் பாதையில் முக்கிய மாற்றங்களைக் கொண்டுவரும்.`,
                health: {
                    ...val.health,
                    summary: "உடல் நலம்: " + val.health.summary
                }
            }
        ])
    )
};
