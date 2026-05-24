/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        enosa: { 950: '#07141f', 900: '#0b1b2a', 800: '#123047', 700: '#164563', 500: '#1f8abf', 400: '#38b6df' },
        copper: '#c9843f',
        stitch: {
          background: '#f7f9fb',
          'primary-fixed': '#dce1ff',
          primary: '#00236f',
          secondary: '#06b6d4',
          'on-primary': '#ffffff',
          'on-primary-fixed': '#00164e',
          'surface-container-lowest': '#ffffff',
          'surface-container-low': '#f2f4f6',
          'surface-container-high': '#e6e8ea',
          'outline-variant': '#c5c5d3',
          'on-surface': '#191c1e',
          'on-surface-variant': '#444651',
          error: '#ba1a1a',
        }
      },
      boxShadow: { panel: '0 18px 50px rgba(7, 20, 31, .12)' },
    },
  },
  plugins: [],
};
