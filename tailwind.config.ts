import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                celestial: {
                    50: "#f0f4ff",
                    100: "#e0e9fe",
                    200: "#c1d3fe",
                    300: "#92b1fd",
                    400: "#5c85fa",
                    500: "#3455f5",
                    600: "#2136e9",
                    700: "#1b28d6",
                    800: "#1d23ad",
                    900: "#1e2489",
                    950: "#111453",
                },
                gold: {
                    50: "#fbfaf7",
                    100: "#f4f1e8",
                    200: "#e9e1d0",
                    300: "#d7c6aa",
                    400: "#c1a57c",
                    500: "#b08d5b",
                    600: "#a1784c",
                    700: "#866041",
                    800: "#6e4f3a",
                    900: "#5e4334",
                    950: "#36241c",
                },
            },
            fontFamily: {
                tamil: ["var(--font-tamil)", "sans-serif"],
                inter: ["var(--font-inter)", "sans-serif"],
                serif: ["var(--font-serif)", "serif"],
            },
        },
    },
    plugins: [],
};
export default config;
