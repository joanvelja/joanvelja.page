/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        paper: "var(--paper)",
        ink: "var(--ink)",
        crimson: {
          50: '#fdf2f2',
          100: '#fde8e8',
          200: '#fbd5d5',
          300: '#f8b4b4',
          400: '#f98080',
          500: '#f05252',
          600: '#e02424',
          700: '#c81e1e',
          800: '#9b1c1c',
          900: '#771d1d',
          950: '#3f0708',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)'],
        mono: ['var(--font-jetbrains-mono)'],
        serif: ['var(--font-crimson-pro)'],
      },
      fontSize: {
        'display-large': ['3.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display': ['2.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'h1': ['2rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'h2': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'h3': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        'body-large': ['1.125rem', { lineHeight: '1.75' }],
        'body': ['1rem', { lineHeight: '1.75' }],
        'small': ['0.875rem', { lineHeight: '1.5' }],
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.5s ease-out forwards',
        'buzz': 'buzz 0.15s ease-in-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        buzz: {
          '0%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            'p, ul, ol, li, blockquote': {
              fontFamily: 'var(--font-crimson-pro)',
              lineHeight: '1.75rem',
            },
            'h1, h2, h3, h4': {
              fontFamily: 'var(--font-crimson-pro)',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar'),
  ],
};

export default config;

module