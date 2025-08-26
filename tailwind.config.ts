import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        mystic: {
          bg1: '#1b1036', // purple-900-ish
          bg2: '#0a0717', // near-black
          primary: '#6d28d9', // purple-700
          primary2: '#5b21b6', // purple-800
          accent: '#f59e0b', // amber-500
          accent2: '#fbbf24', // amber-400
        },
      },
      backgroundImage: {
        'mystic-gradient':
          'radial-gradient(60% 60% at 30% 20%, rgba(109,40,217,0.35) 0%, rgba(10,7,23,0) 60%), radial-gradient(40% 40% at 80% 10%, rgba(251,191,36,0.15) 0%, rgba(10,7,23,0) 60%)',
      },
      boxShadow: {
        glow: '0 0 30px rgba(251,191,36,0.35), 0 0 60px rgba(109,40,217,0.25)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        cinzel: ['var(--font-cinzel)', 'serif'],
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
