/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
        chat: {
          user: "hsl(200, 100%, 50%)",
          assistant: "hsl(210, 20%, 98%)",
          "user-dark": "hsl(200, 100%, 45%)",
          "assistant-dark": "hsl(210, 11%, 15%)",
        },
        cyber: {
          50: "#ecfeff",
          100: "#cffafe", 
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344"
        },
        electric: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0", 
          300: "#86efac",
          400: "#4ade80",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22"
        },
        neon: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d", 
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "typing": {
          "0%, 60%": { opacity: 0 },
          "30%": { opacity: 1 },
        },
        "pulse-glow": {
          "0%": { 
            boxShadow: "0 0 5px rgba(6, 182, 212, 0.5)",
            transform: "scale(1)"
          },
          "50%": {
            boxShadow: "0 0 25px rgba(6, 182, 212, 0.8), 0 0 35px rgba(6, 182, 212, 0.4)",
            transform: "scale(1.05)"
          },
          "100%": { 
            boxShadow: "0 0 5px rgba(6, 182, 212, 0.5)",
            transform: "scale(1)"
          }
        },
        "cyber-pulse": {
          "0%, 100%": { 
            filter: "hue-rotate(0deg) brightness(1)",
            transform: "scale(1)"
          },
          "50%": { 
            filter: "hue-rotate(90deg) brightness(1.2)",
            transform: "scale(1.02)"
          }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-10px) rotate(1deg)" },
          "66%": { transform: "translateY(5px) rotate(-1deg)" }
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "glow-rotate": {
          "0%": { transform: "rotate(0deg)", filter: "hue-rotate(0deg)" },
          "100%": { transform: "rotate(360deg)", filter: "hue-rotate(360deg)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "typing": "typing 1.4s infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "cyber-pulse": "cyber-pulse 3s ease-in-out infinite",
        "float": "float 8s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "glow-rotate": "glow-rotate 4s linear infinite"
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              'color': 'hsl(var(--primary))',
              'textDecoration': 'underline',
              'textDecorationColor': 'rgba(6, 182, 212, 0.4)',
              '&:hover': {
                'color': 'hsl(var(--primary))',
                'textDecorationColor': 'rgba(6, 182, 212, 0.8)',
              },
            },
            code: {
              'backgroundColor': 'rgba(15, 23, 42, 0.8)',
              'color': '#06b6d4',
              'padding': '0.25rem 0.5rem',
              'borderRadius': '0.375rem',
              'fontSize': '0.875rem',
              'fontWeight': '500',
              'border': '1px solid rgba(148, 163, 184, 0.2)',
            },
            pre: {
              'backgroundColor': 'rgba(15, 23, 42, 0.95)',
              'border': '1px solid rgba(148, 163, 184, 0.2)',
              'borderRadius': '0.5rem',
            }
          },
        },
        cyan: {
          css: {
            '--tw-prose-links': '#06b6d4',
            '--tw-prose-invert-links': '#67e8f9',
            '--tw-prose-code': '#06b6d4',
            '--tw-prose-invert-code': '#67e8f9',
          }
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(6, 182, 212, 0.3)',
        'glow': '0 0 20px rgba(6, 182, 212, 0.4)',
        'glow-lg': '0 0 30px rgba(6, 182, 212, 0.5)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.4)',
        'glow-orange': '0 0 20px rgba(245, 158, 11, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(6, 182, 212, 0.1)',
      },
      backgroundImage: {
        'gradient-cyber': 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #06b6d4 100%)',
        'gradient-mesh': 'radial-gradient(600px circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 40%), radial-gradient(400px circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 40%), radial-gradient(300px circle at 20% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 40%)',
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography")
  ],
} 