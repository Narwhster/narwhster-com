/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#023E8A',
        'secondary': '#F8B34B',
        'highlight': '#F0D760',
        'accent': '#90E0EF',
        'accent-dark': '#48CAE4',
        'background': '#FFFFFF',
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

