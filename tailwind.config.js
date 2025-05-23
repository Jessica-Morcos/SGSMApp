/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [  "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}", ],
  darkMode: "media",
  theme: {
    extend: {
      fontSize: {
        '8xl': '80px',
        '9xl': '96px',
      },
      colors: {
        primary: "#DD3333",
        accent: "#AB8BFF",
        secondary: "#151312",
        light: {
          100: "#D6C7FF",
          200: "#A8B5DB",
          300: "#9CA4AA"
        },
        dark: {
          100: "#221F3D",
          200: "#0F0D23"
        }
      }
    }
  },
  plugins: []
};
