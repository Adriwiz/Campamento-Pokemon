/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm': '480px',
      'md': '510px',
      'lg': '767px',
      'xl': '990px',
      '2xl': '1920px',
    },
    extend: {},
  },
  plugins: [],
}