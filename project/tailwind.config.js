/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a192f',
          dark: '#020c1b',
        },
        pink: {
          DEFAULT: '#f72585',
          dark: '#b5179e',
          light: '#f8c8dc',
        },
        purple: '#7209b7',
      },
    },
  },
  plugins: [],
};