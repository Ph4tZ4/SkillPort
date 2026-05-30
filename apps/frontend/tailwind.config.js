/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdfdfd',
          100: '#f7f7f7',
          200: '#ebebeb',
          300: '#dfdfdf',
          400: '#c2c2c2',
          500: '#a3a3a3',
          600: '#7a7a7a',
          700: '#525252',
          800: '#2e2e2e',
          900: '#141414',
          950: '#050505',
        },
        accent: {
          50:  '#fcfaf6',
          100: '#f7f2e8',
          200: '#eee0cc',
          300: '#e1c6a6',
          400: '#d1a679',
          500: '#c38b55',
          600: '#b47346',
          700: '#965a3b',
          800: '#7a4a34',
          900: '#623d2d',
          950: '#351f16',
        },
        surface: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'float': '0 10px 30px -10px rgba(0, 0, 0, 0.08)',
        'elevate': '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
