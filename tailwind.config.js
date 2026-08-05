/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // One face throughout. The slab-serif display font read dated beside the data, and mixing
      // a serif headline with a humanist body gave the pages two different voices.
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        data: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Rotary's own palette — primary is mandated, the secondaries are the official
        // Rotary secondary colours and are used for goal status.
        royal: '#003DA5',
        gold: '#F7A81B',
        azure: '#0067C8',
        ink: '#0A1A33',
        sidebar: '#0F172A',   // kept as-is by request — the original sidebar ground
        ledger: '#F1F4FA',
        grass: '#009739',
        cranberry: '#C8102E',
        smoke: '#B5B5B5',
        rotary: {
          blue: '#003DA5',
          gold: '#F7A81B',
          lightblue: '#0096D6',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
