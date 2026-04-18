import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          light: '#F8F9FA',
          dark: '#1A1D27',
        },
        accent: {
          light: '#2563EB',
          dark: '#60A5FA',
        },
        muted: {
          light: '#6B7280',
          dark: '#94A3B8',
        },
        border: {
          light: '#E5E7EB',
          dark: '#2D3748',
        },
      },
      fontFamily: {
        serif: ['Lora', ...defaultTheme.fontFamily.serif],
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            fontFamily: theme('fontFamily.sans').join(', '),
            h1: { fontFamily: theme('fontFamily.serif').join(', ') },
            h2: { fontFamily: theme('fontFamily.serif').join(', ') },
            h3: { fontFamily: theme('fontFamily.serif').join(', ') },
            code: { fontFamily: theme('fontFamily.mono').join(', ') },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
