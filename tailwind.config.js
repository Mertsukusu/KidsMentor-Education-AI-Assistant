/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4da6ff',
          DEFAULT: '#0080ff',
          dark: '#0059b3',
        },
        secondary: {
          light: '#ffb84d',
          DEFAULT: '#ff9900',
          dark: '#cc7a00',
        },
      },
    },
  },
  plugins: [],
} 