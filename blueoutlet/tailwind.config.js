/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Adicionando os tamanhos personalizados aqui
      spacing: {
        '100': '25rem',    // 400px
        '125': '31.25rem', // 500px
        '130': '32.5rem',  // 520px
      },
    },
  },
  plugins: [],
};