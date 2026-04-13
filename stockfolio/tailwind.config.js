/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // Required for programmatic dark mode toggle via NativeWind's setColorScheme
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        premium: {
          dark: "#0F172A", // Slate 900
          card: "#1E293B", // Slate 800
          accent: "#38BDF8", // Cyan 400
          success: "#10B981", // Emerald 500
          danger: "#EF4444", // Red 500
          gold: "#FBBF24", // Amber 400
        }
      }
    },
  },
  plugins: [],
};
