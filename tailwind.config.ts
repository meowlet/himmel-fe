import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-google-sans)", "sans-serif"],
      },
      colors: {
        light: {
          background: "#FDF7FF",
          onBackground: "#1D1B20",
          surface: "#FDF7FF",
          onSurface: "#1D1B20",
          primary: {
            DEFAULT: "#65558F",
            container: "#E9DDFF",
          },
          onPrimary: "#FFFFFF",
          onPrimaryContainer: "#211047",
          secondary: {
            DEFAULT: "#625B70",
            container: "#E8DEF8",
          },
          onSecondary: "#FFFFFF",
          onSecondaryContainer: "#1E192B",
          tertiary: {
            DEFAULT: "#7E5260",
            container: "#FFD9E3",
          },
          onTertiary: "#FFFFFF",
          onTertiaryContainer: "#31101D",
          error: {
            DEFAULT: "#BA1A1A",
            container: "#FFDAD6",
          },
          onError: "#FFFFFF",
          onErrorContainer: "#410002",
          surfaceVariant: "#E7E0EB",
          onSurfaceVariant: "#49454E",
          outline: "#7A757F",
        },
        dark: {
          background: "#141218",
          onBackground: "#E6E0E9",
          surface: "#141218",
          onSurface: "#E6E0E9",
          primary: {
            DEFAULT: "#CFBDFE",
            container: "#4D3D75",
          },
          onPrimary: "#36265D",
          onPrimaryContainer: "#E9DDFF",
          secondary: {
            DEFAULT: "#CCC2DB",
            container: "#4A4458",
          },
          onSecondary: "#332D41",
          onSecondaryContainer: "#E8DEF8",
          tertiary: {
            DEFAULT: "#EFB8C8",
            container: "#633B48",
          },
          onTertiary: "#4A2532",
          onTertiaryContainer: "#FFD9E3",
          error: {
            DEFAULT: "#FFB4AB",
            container: "#93000A",
          },
          onError: "#690005",
          onErrorContainer: "#FFDAD6",
          surfaceVariant: "#49454E",
          onSurfaceVariant: "#CAC4CF",
          outline: "#948F99",
        },
      },
    },
  },
  plugins: [
    require("tailwind-fontawesome")({
      pro: true,
    }),
  ],
};

export default config;
