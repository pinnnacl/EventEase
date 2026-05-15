/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
      "3xl": "1920px",
    },
    extend: {
      maxWidth: {
        content: "80rem",
        "content-wide": "87.5rem",
      },
      colors: {
        /** Single app canvas — white; use bg-background / bg-canvas sitewide */
        background: "#ffffff",
        canvas: "#ffffff",
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#0f766e",
          600: "#0b5e58",
          700: "#134e4a",
          800: "#115e59",
          900: "#042f2e",
        },
        wedding: {
          cream: "#ffffff",
          beige: "#efe6d9",
          gold: "#d4af37",
          softgold: "#e7c86e",
          ink: "#22303b",
        },
        /** Velvet & Gilded — makeup artist demo */
        velvet: {
          ivory: "#FAF9F6",
          gold: "#D4A373",
          rose: "#8C4B55",
          ink: "#3d2a2c",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["Gilroy", "Inter", "system-ui", "sans-serif"],
        arial: ["Arial", "Helvetica Neue", "Helvetica", "sans-serif"],
        "makeup-sans": ["var(--font-makeup-body)", "Manrope", "system-ui", "sans-serif"],
        "makeup-serif": ["var(--font-makeup-display)", "Noto Serif", "Georgia", "serif"],
      },
      boxShadow: {
        premium: "0 12px 36px -16px rgba(20, 43, 60, 0.28)",
        card: "0 8px 24px -14px rgba(31, 41, 55, 0.22)",
      },
      backgroundImage: {
        "wedding-gradient": "linear-gradient(135deg, #ffffff 0%, #ffffff 100%)",
        "gold-wash": "linear-gradient(120deg, rgba(212,175,55,0.14) 0%, rgba(255,255,255,0.92) 60%)",
      },
      keyframes: {
        "ee-dropdown-in": {
          "0%": { opacity: "0", transform: "translateY(-6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "ee-reel-modal-backdrop": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "ee-reel-modal-panel": {
          "0%": { opacity: "0", transform: "scale(0.94) translateY(10px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        "ee-dropdown-in": "ee-dropdown-in 0.2s ease-out forwards",
        "ee-reel-modal-backdrop": "ee-reel-modal-backdrop 0.28s ease-out forwards",
        "ee-reel-modal-panel": "ee-reel-modal-panel 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },
  plugins: [],
};
