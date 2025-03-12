/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy': '#1D3557',
        'brown': '#8B4513',
        'blue': '#2B6CB0',
        'orange': '#E76F51',
        'warm-bg': '#F5E6D3',
      },
    },
  },
  plugins: [],
}
