import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
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
        // Custom section colors
        tory: {
          '50': 'hsl(var(--tory-50))',
          '100': 'hsl(var(--tory-100))',
          '200': 'hsl(var(--tory-200))',
          '300': 'hsl(var(--tory-300))',
          '400': 'hsl(var(--tory-400))',
          '500': 'hsl(var(--tory-500))',
          '600': 'hsl(var(--tory-600))',
          '700': 'hsl(var(--tory-700))',
          '800': 'hsl(var(--tory-800))',
          '900': 'hsl(var(--tory-900))',
          '950': 'hsl(var(--tory-950))',
        },
        today: {
          '50': 'hsl(var(--today-50))',
          '100': 'hsl(var(--today-100))',
          '200': 'hsl(var(--today-200))',
          '300': 'hsl(var(--today-300))',
          '400': 'hsl(var(--today-400))',
          '500': 'hsl(var(--today-500))',
          '600': 'hsl(var(--today-600))',
          '700': 'hsl(var(--today-700))',
          '800': 'hsl(var(--today-800))',
          '900': 'hsl(var(--today-900))',
          '950': 'hsl(var(--today-950))',
        },
        science: {
          '50': 'hsl(var(--science-50))',
          '100': 'hsl(var(--science-100))',
          '200': 'hsl(var(--science-200))',
          '300': 'hsl(var(--science-300))',
          '400': 'hsl(var(--science-400))',
          '500': 'hsl(var(--science-500))',
          '600': 'hsl(var(--science-600))',
          '700': 'hsl(var(--science-700))',
          '800': 'hsl(var(--science-800))',
          '900': 'hsl(var(--science-900))',
          '950': 'hsl(var(--science-950))',
        },
        law: {
          '50': 'hsl(var(--law-50))',
          '100': 'hsl(var(--law-100))',
          '200': 'hsl(var(--law-200))',
          '300': 'hsl(var(--law-300))',
          '400': 'hsl(var(--law-400))',
          '500': 'hsl(var(--law-500))',
          '600': 'hsl(var(--law-600))',
          '700': 'hsl(var(--law-700))',
          '800': 'hsl(var(--law-800))',
          '900': 'hsl(var(--law-900))',
          '950': 'hsl(var(--law-950))',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
