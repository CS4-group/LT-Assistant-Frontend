/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#c42525',
          hover: '#d63031',
          dark: '#ef4444',
        },
      },
      fontFamily: {
        body: ['Figtree', 'system-ui', 'sans-serif'],
        heading: ['Syne', 'Trebuchet MS', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.67rem',
        lg: '1rem',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      },
      transitionTimingFunction: {
        bounce: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
        spring: 'cubic-bezier(0.2, 1.1, 0.3, 1.3)',
        'spring-heavy': 'cubic-bezier(0.34, 1.6, 0.64, 1)',
        bouncy: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      backdropBlur: {
        glass: '16px',
      },
    },
  },
  plugins: [],
}
