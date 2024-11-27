/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#30C136",
        secondary: "#9EA19E",
        text: "#181616",
        background: "#DADADA",
      }
    },
  },
  plugins: [],
}

