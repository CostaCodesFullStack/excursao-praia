var config = {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background) / <alpha-value>)",
                foreground: "hsl(var(--foreground) / <alpha-value>)",
                muted: "hsl(var(--muted) / <alpha-value>)",
                "muted-foreground": "hsl(var(--muted-foreground) / <alpha-value>)",
                panel: "hsl(var(--panel) / <alpha-value>)",
                border: "hsl(var(--border) / <alpha-value>)",
                ring: "hsl(var(--ring) / <alpha-value>)",
                accent: {
                    DEFAULT: "hsl(var(--accent) / <alpha-value>)",
                    foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
                },
                success: {
                    DEFAULT: "hsl(var(--success) / <alpha-value>)",
                    foreground: "hsl(var(--success-foreground) / <alpha-value>)",
                },
                warning: {
                    DEFAULT: "hsl(var(--warning) / <alpha-value>)",
                    foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
                },
                danger: {
                    DEFAULT: "hsl(var(--danger) / <alpha-value>)",
                    foreground: "hsl(var(--danger-foreground) / <alpha-value>)",
                },
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.5rem",
                "3xl": "2rem",
            },
            boxShadow: {
                soft: "0 24px 60px -32px rgba(15, 23, 42, 0.45)",
            },
            fontFamily: {
                body: ["DM Sans", "sans-serif"],
                display: ["Syne", "sans-serif"],
            },
            keyframes: {
                "slide-up": {
                    "0%": { opacity: "0", transform: "translateY(18px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "200% 0" },
                    "100%": { backgroundPosition: "-200% 0" },
                },
            },
            animation: {
                "slide-up": "slide-up 220ms ease-out",
                shimmer: "shimmer 1.8s linear infinite",
            },
        },
    },
    plugins: [],
};
export default config;
