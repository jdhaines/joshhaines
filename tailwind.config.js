// @ts-check
const { fontFamily } = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

/** @type {import("tailwindcss/types").Config } */
module.exports = {
  content: [
    './node_modules/pliny/**/*.js',
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './layouts/**/*.{js,ts,tsx}',
    './data/**/*.mdx',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      lineHeight: {
        11: '2.75rem',
        12: '3rem',
        13: '3.25rem',
        14: '3.5rem',
      },
      fontFamily: {
        // sans: ['var(--font-space-grotesk)', ...fontFamily.sans],
        sans: ['var(--font-notoSansDisplay)', ...fontFamily.sans],
      },
      colors: {
        gray: colors.gray,
        jgreen: {
          100: '#B3E6B7',
          300: '#A1E6A6',
          500: '#7BCC80',
          700: '#6B996E',
          900: '#28852E',
        },
        jblue: {
          100: '#7AD0F1',
          300: '#4DC1ED',
          500: '#25B3E9',
          700: '#07A6E2',
          900: '#037CAA',
        },
        jyellow: {
          100: '#FFD97B',
          300: '#FFCB4B',
          500: '#FFBF1F',
          700: '#FFB600',
          900: '#D79901',
        },
        jred: {
          100: '#FF927B',
          200: '#FF7E63',
          300: '#FF6A4B',
          400: '#FF5835',
          500: '#FF461F',
          600: '#FF3910',
          700: '#FF2C00',
          800: '#EB2901',
          900: '#D72601',
        },
        primary: {
          100: '#FF927B',
          200: '#FF7E63',
          300: '#FF6A4B',
          400: '#FF5835',
          500: '#FF461F',
          600: '#FF3910',
          700: '#FF2C00',
          800: '#EB2901',
          900: '#D72601',
        },
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            a: {
              color: theme('colors.primary.500'),
              '&:hover': {
                color: `${theme('colors.primary.600')}`,
              },
              code: { color: theme('colors.primary.400') },
            },
            'h1,h2': {
              fontWeight: '700',
              letterSpacing: theme('letterSpacing.tight'),
            },
            h3: {
              fontWeight: '600',
            },
            code: {
              color: theme('colors.primary.500'),
            },
          },
        },
        invert: {
          css: {
            a: {
              color: theme('colors.primary.500'),
              '&:hover': {
                color: `${theme('colors.primary.400')}`,
              },
              code: { color: theme('colors.primary.400') },
            },
            'h1,h2,h3,h4,h5,h6': {
              color: theme('colors.gray.100'),
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
