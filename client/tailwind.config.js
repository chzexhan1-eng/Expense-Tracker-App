/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Notion & Stripe inspired theme colors
        notion: {
          bg: {
            light: '#ffffff',
            dark: '#191919',
          },
          sidebar: {
            light: '#f7f7f5',
            dark: '#202020',
          },
          border: {
            light: '#e9e9e6',
            dark: '#2e2e2e',
          },
          text: {
            light: '#37352f',
            dark: '#e3e3e2',
            muted: {
              light: '#787774',
              dark: '#9b9a97',
            }
          }
        },
        stripe: {
          primary: '#635bff',
          hover: '#0a2540',
          accent: '#00d4b2',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'premium': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'premium-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03), 0 10px 15px -3px rgba(0, 0, 0, 0.03), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
}
