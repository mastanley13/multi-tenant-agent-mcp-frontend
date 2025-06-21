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
          dark: "hsl(var(--primary-dark))",
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
        warning: {
          DEFAULT: "hsl(var(--warning))",
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
          user: "hsl(206, 100%, 50%)",
          assistant: "hsl(220, 13%, 97%)",
          "user-dark": "hsl(206, 100%, 45%)",
          "assistant-dark": "hsl(217, 33%, 17%)",
        },
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
        "subtle-glow": {
          "0%": { boxShadow: "0 0 0 rgba(14, 165, 233, 0)" },
          "100%": { boxShadow: "0 0 20px rgba(14, 165, 233, 0.15)" }
        },
        "smooth-slide": {
          "from": { transform: "translateY(10px)", opacity: 0 },
          "to": { transform: "translateY(0)", opacity: 1 }
        },
        "scale-in": {
          "from": { opacity: 0, transform: "scale(0.9)" },
          "to": { opacity: 1, transform: "scale(1)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "typing": "typing 1.4s infinite",
        "subtle-glow": "subtle-glow 2s ease-in-out infinite alternate",
        "smooth-slide": "smooth-slide 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out"
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              'color': 'hsl(var(--primary))',
              'textDecoration': 'underline',
              'textDecorationColor': 'rgba(14, 165, 233, 0.4)',
              '&:hover': {
                'color': 'hsl(var(--primary))',
                'textDecorationColor': 'rgba(14, 165, 233, 0.8)',
              },
            },
            code: {
              'backgroundColor': 'hsl(var(--muted))',
              'color': 'hsl(var(--primary))',
              'padding': '0.25rem 0.5rem',
              'borderRadius': '0.375rem',
              'fontSize': '0.875rem',
              'fontWeight': '500',
              'border': '1px solid hsl(var(--border))',
            },
            pre: {
              'backgroundColor': 'hsl(var(--card))',
              'border': '1px solid hsl(var(--border))',
              'borderRadius': '0.5rem',
            }
          },
        },
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(14, 165, 233, 0.15)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-success': 'var(--gradient-success)',
        'gradient-surface': 'var(--gradient-surface)',
        'gradient-subtle': 'var(--gradient-subtle)',
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography")
  ],
} 