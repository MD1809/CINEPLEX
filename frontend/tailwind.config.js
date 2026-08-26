/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "var(--primary-red-glow)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        cinema: {
          dark: "#121317",
          surface: "#1e1f23",
          elevated: "#292a2e",
          red: "#e50914",
          gold: "#e9c349",
          pink: "#ec4899",
        },
        cine: {
          dark: "#121317",
          surface: "#1e1f23",
          "surface-elevated": "#292a2e",
          red: "#e50914",
          gold: "#e9c349",
          pink: "#ec4899",
        },
        seat: {
          available: "#475569",
          selected: "#22c55e",
          held: "#f97316",
          booked: "#23272f",
          vip: "#e9c349",
          sweetbox: "#ec4899",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Montserrat", "Inter", "sans-serif"],
      },
      boxShadow: {
        "cinema-red": "0 0 25px -5px rgba(229, 9, 20, 0.5)",
        "cinema-gold": "0 0 25px -5px rgba(233, 195, 73, 0.4)",
        "screen-glow": "0 10px 40px -10px rgba(229, 9, 20, 0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
