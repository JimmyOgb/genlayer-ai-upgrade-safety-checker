/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0C0F",
        panel: "#12161D",
        "panel-raised": "#171C24",
        hairline: "#232A35",
        ink: {
          primary: "#E7EAF0",
          muted: "#7E8797",
          faint: "#4B515E",
        },
        verdict: {
          safe: "#2FB6A6",
          "safe-dim": "#1B3F3A",
          risk: "#C9472E",
          "risk-dim": "#3A2220",
          pending: "#D6A23C",
          "pending-dim": "#3A301C",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        widest2: "0.18em",
      },
      backgroundImage: {
        "grain": "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)",
      },
      backgroundSize: {
        grain: "14px 14px",
      },
      keyframes: {
        stamp: {
          "0%": { opacity: "0", transform: "scale(2.2) rotate(-14deg)" },
          "60%": { opacity: "1", transform: "scale(0.96) rotate(-7deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(-6deg)" },
        },
      },
      animation: {
        stamp: "stamp 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
      },
    },
  },
  plugins: [],
};
