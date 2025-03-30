/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        product2: {
          primary: "#4CAF50",
          secondary: "#2196F3",
        },
      },
    },
  },
  plugins: [],
};
