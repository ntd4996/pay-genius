import type { Config } from 'tailwindcss';
const { nextui } = require('@nextui-org/react');
const {
  default: flattenColorPalette,
} = require('tailwindcss/lib/util/flattenColorPalette');

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],

  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff6426',
        },
        secondary: {
          DEFAULT: '#405484',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        input: `0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)`,
      },
      fontFamily: {
        astroSpace: ['AstroSpace', 'sans-serif'],
      },
      minHeight: {
        'full-screen': 'calc(100vh - 70px)',
        'full-content': 'calc(100vh - 70px - 64px)',
        'card-message': '400px',
      },
      height: {
        'card-message': '400px',
      },
    },
  },
  plugins: [nextui(), 'prettier-plugin-tailwindcss', addVariablesForColors],
};

function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme('colors'));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ':root': newVars,
  });
}
export default config;
