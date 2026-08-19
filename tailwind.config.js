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
        // Domino's Design System Palette
        primary: {
          DEFAULT: '#10789f', // Steel Blue
          50: '#f0f9fb',
          100: '#d7eff6',
          200: '#b4e0ed',
          300: '#82c9df',
          400: '#48abcc',
          500: '#10789f',
          600: '#0d6282',
          700: '#0c506c',
          800: '#0f4359',
          900: '#11394c',
        },
        brand: {
          50: '#f0f9fb',
          100: '#d7eff6',
          200: '#b4e0ed',
          300: '#82c9df',
          400: '#48abcc',
          500: '#10789f', // Steel Blue (Dominant structural color)
          600: '#0d6282',
          700: '#0c506c',
          800: '#0f4359',
          900: '#11394c',
          DEFAULT: '#10789f',
        },
        dominos: {
          blue: '#10789f',
          red: '#e3193b',
          'red-hover': '#cc1433',
          ink: '#333333',
          'ink-muted': '#858585',
          'ink-light': '#767676',
          canvas: '#ffffff',
          surface: '#f4f6f8',
          hairline: '#d9d9d9',
        },
        accent: {
          DEFAULT: '#e3193b', // Domino's Brand Red
          hover: '#cc1433',
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#e3193b',
          600: '#cc1433',
          700: '#be123c',
        },
        ink: {
          DEFAULT: '#333333',
          muted: '#858585',
          light: '#767676',
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
        sans: ['Prompt', 'Arial', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'Prompt', '"Arial Narrow"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 20px -2px rgba(16, 120, 159, 0.08)',
        'glow-blue': '0 0 20px rgba(16, 120, 159, 0.25)',
        'glow-red': '0 0 20px rgba(227, 25, 59, 0.35)',
      },
    },
  },
  plugins: [],
}
