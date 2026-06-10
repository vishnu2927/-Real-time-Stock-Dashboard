/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dashboard: {
          navy: '#0A0E1A',
          green: '#00D4AA',
          red: '#FF4757'
        }
      }
    }
  },
  plugins: []
};
