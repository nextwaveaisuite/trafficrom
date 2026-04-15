/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#edfff6',
          100: '#d5ffec',
          200: '#aeffda',
          300: '#70ffbd',
          400: '#2bef97',
          500: '#00d478',
          600: '#00ad60',
          700: '#008a4e',
          800: '#006c3f',
          900: '#005834',
        },
        dark: {
          900: '#0a0e1a',
          800: '#0f1525',
          700: '#151d30',
          600: '#1e2840',
          500: '#273350',
        }
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
};
