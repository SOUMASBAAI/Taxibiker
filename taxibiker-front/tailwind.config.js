/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',  // Tous les fichiers JS, JSX, TS, TSX sous src/
    './public/index.html',          // Le fichier HTML si tu en as un dans public/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
