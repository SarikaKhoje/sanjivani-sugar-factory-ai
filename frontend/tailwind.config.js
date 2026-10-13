/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#0B331A',
        },
        cream: {
          50: '#FDFBF7',
          100: '#FBF9F4',
          200: '#F6F2E9',
          300: '#EEE8D9',
          400: '#E2D9C3',
          500: '#D4C7A8',
        },
        cane: {
          light: '#ECFDF5',
          gold: '#D97706',
          lime: '#65A30D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 2px 6px -1px rgba(15, 56, 34, 0.06), 0 1px 4px -2px rgba(15, 56, 34, 0.04)',
        'elevated': '0 10px 25px -5px rgba(15, 56, 34, 0.08), 0 8px 10px -6px rgba(15, 56, 34, 0.04)',
      }
    },
  },
  plugins: [],
}
