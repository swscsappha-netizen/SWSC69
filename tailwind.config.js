/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Chipotle Design System Palette
        chipotle: {
          ink: '#451400',          // Load-bearing burnt-umber chrome
          'ink-soft': '#6b321b',   // Warm roasted chili stop
          ash: '#786259',          // Muted mid-brown outline
          white: '#ffffff',        // Tile fill
          cream: '#f2f2f2',        // Promo card background
          'hairline-soft': '#d4cbc7',
          gold: '#b68207',         // Mustard gold brand voltage
          'gold-deep': '#976500',
          'gold-tint': '#a76721',
          red: '#ad2118',          // Crimson Rewards red
          'red-deep': '#9c1f16',
          'red-soft': '#b3473f',
        },
        primary: {
          DEFAULT: '#451400',      // Burnt Umber Ink
          50: '#fdf8f6',
          100: '#f7ede8',
          200: '#eddcd4',
          300: '#dec2b4',
          400: '#cb9f8c',
          500: '#b77f68',
          600: '#8e543d',
          700: '#6b321b',
          800: '#52200c',
          900: '#451400',
        },
        brand: {
          50: '#fdf8f6',
          100: '#f7ede8',
          200: '#eddcd4',
          300: '#dec2b4',
          400: '#cb9f8c',
          500: '#451400',
          600: '#52200c',
          700: '#6b321b',
          DEFAULT: '#451400',
        },
        gold: {
          DEFAULT: '#b68207',
          hover: '#976500',
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#b68207',
          600: '#976500',
        },
        accent: {
          DEFAULT: '#b68207',      // Mustard Gold
          red: '#ad2118',          // Rewards Red
          hover: '#976500',
        },
        ink: {
          DEFAULT: '#451400',
          soft: '#6b321b',
          muted: '#786259',
          light: '#d4cbc7',
          black: '#000000',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        sans: ['Nunito', 'Prompt', 'Arial', 'sans-serif'],
        display: ['"Trade Gothic LT Bold"', 'Oswald', '"Barlow Condensed"', 'Prompt', 'sans-serif'],
        condensed: ['"Trade Gothic LT Bold"', 'Oswald', '"Barlow Condensed"', 'Prompt', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        'md': '12px',
      },
      boxShadow: {
        'tile': '0px 0px 40px rgba(0, 0, 0, 0.06)',
        'soft': '0 2px 8px -1px rgba(69, 20, 0, 0.05)',
        'glow-gold': '0 0 20px rgba(182, 130, 7, 0.35)',
      },
    },
  },
  plugins: [],
}
