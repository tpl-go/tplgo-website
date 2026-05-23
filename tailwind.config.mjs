/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./app/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryText: "#1a2a44",
        labelText: "#374151",
        borderPrimary: "#1f2937",
        brandOrange: "#f97316",
        brandOrangeDark: "#ea580c",
      },
    },
  },
  plugins: [],
};