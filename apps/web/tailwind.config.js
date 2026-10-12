/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette (2026-10 homepage review): royal blue leads, night blue for
        // headings and dark sections, amber only as a small accent (~5%).
        primary: {
          50: '#eef1fb',
          100: '#dbe2f7',
          500: '#4a66d6',
          600: '#3452cc',
          700: '#2a43ab',
        },
        navy: '#22345f',
        secondary: {
          500: '#e8a23c',
          600: '#c9862a',
        },
        surface: '#f7f8fb',
        gold: '#ffd080', // light gold text on royal blue
        ink: '#18233d', // main text / section headings
        muted: '#687386', // secondary text
        line: '#e0e6ef', // light card borders
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
