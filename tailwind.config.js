/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#14161B",
          50: "#F4F5F6",
          100: "#E4E6E9",
          200: "#C3C7CE",
          300: "#9BA1AB",
          400: "#6E7481",
          500: "#4B505C",
          600: "#363A44",
          700: "#24262E",
          800: "#1A1C22",
          900: "#14161B",
          950: "#0C0D10",
        },
        paper: {
          DEFAULT: "#EEF0EC",
          100: "#FFFFFF",
          200: "#F6F7F3",
          300: "#EEF0EC",
          400: "#E1E4DD",
        },
        signal: {
          DEFAULT: "#FF5A36",
          50: "#FFF1EC",
          100: "#FFDED1",
          400: "#FF7A54",
          500: "#FF5A36",
          600: "#E23F1D",
          700: "#B93116",
        },
        track: {
          DEFAULT: "#2F6F5E",
          50: "#EAF4F1",
          100: "#CFE6DE",
          400: "#3E9280",
          500: "#2F6F5E",
          600: "#245749",
        },
        route: {
          ios: "#4F7CE8",
          android: "#57B06B",
          desktop: "#D3922F",
        },
      },
      fontFamily: {
        // System-first stacks: no external font fetch, so the build never
        // depends on network access. Still reads as a deliberate pairing —
        // a geometric display face for headings, a neutral body face, and
        // a true mono for short codes / timestamps / stats.
        display: [
          "Century Gothic",
          "Futura",
          "Poppins",
          "Trebuchet MS",
          "ui-sans-serif",
          "sans-serif",
        ],
        body: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "ui-sans-serif",
          "sans-serif",
        ],
        mono: [
          "SF Mono",
          "Consolas",
          "Menlo",
          "Liberation Mono",
          "ui-monospace",
          "monospace",
        ],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(20,22,27,0.06)",
        lift: "0 12px 32px -12px rgba(20,22,27,0.25)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(20,22,27,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(20,22,27,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "28px 28px",
      },
    },
  },
  plugins: [],
};
