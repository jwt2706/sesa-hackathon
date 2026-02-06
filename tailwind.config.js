/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f9ecee',
          100: '#f2d6db',
          200: '#e1adb6',
          300: '#cf848f',
          400: '#bd5a68',
          500: '#a63342',
          600: '#8f001a',
          700: '#760015',
          800: '#5e0011',
          900: '#3d000b',
        },
        gray: {
          50: '#f6f4f3',
          100: '#ebe7e4',
          200: '#d6d0cb',
          300: '#bfb6b0',
          400: '#a69b94',
          500: '#80746c',
          600: '#6b6059',
          700: '#564d47',
          800: '#3f3a36',
          900: '#2d2d2c',
        },
      },
    },
  },
  plugins: [],
};
