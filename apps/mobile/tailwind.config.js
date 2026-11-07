/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [
    require("nativewind/preset"),
    require("@ayahloop/design-tokens/tailwind-preset"),
  ],
  theme: { extend: {} },
  plugins: [],
};
