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
        // School Colors: Royal Purple & Radiant Gold/Yellow (ม่วง - เหลือง ส.ว.)
        primary: {
          DEFAULT: '#6d28d9', // Royal Purple
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        brand: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#6d28d9', // Royal Purple
          600: '#5b21b6',
          700: '#4c1d95',
          800: '#3b0764',
          900: '#2e1065',
          DEFAULT: '#6d28d9',
        },
        school: {
          purple: '#6d28d9',
          'purple-dark': '#5b21b6',
          'purple-light': '#faf5ff',
          yellow: '#facc15',
          'yellow-hover': '#eab308',
          'yellow-dark': '#ca8a04',
          gold: '#eab308',
        },
        accent: {
          DEFAULT: '#facc15', // Radiant Yellow / Gold
          hover: '#eab308',
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
        },
        ink: {
          DEFAULT: '#1e1b4b',
          muted: '#6b7280',
          light: '#9ca3af',
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
        'card': '0 4px 20px -2px rgba(109, 40, 217, 0.08)',
        'glow-purple': '0 0 20px rgba(109, 40, 217, 0.3)',
        'glow-yellow': '0 0 20px rgba(250, 204, 21, 0.4)',
      },
    },
  },
  plugins: [],
}
