/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#dcf2e4',
          200: '#bbe4cc',
          300: '#8dd0a8',
          400: '#56b57d',
          500: '#4CAF50',
          600: '#2E7D32',
          700: '#1B5E20',
          800: '#0F4E1B',
          900: '#0C4118',
        },
      },
    },
  },
  plugins: [],
}
