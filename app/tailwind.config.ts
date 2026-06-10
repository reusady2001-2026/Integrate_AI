import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        // Hebrew-first stacks; wired to next/font CSS vars in layout.tsx
        body: ["var(--font-body)", "David", "serif"],
        ui: ["var(--font-ui)", "Heebo", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Frank Ruhl Libre", "serif"],
      },
      fontFeatureSettings: {
        tnum: '"tnum"',
      },
    },
  },
  plugins: [],
};

export default config;
