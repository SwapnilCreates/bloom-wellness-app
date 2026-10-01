import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 50px rgba(199, 144, 173, 0.15)',
      },
      colors: {
        blush: '#fdf1f6',
        rose: '#d06f95',
        lilac: '#d9c4f2',
        peach: '#f9d4b8',
      },
    },
  },
  plugins: [],
};

export default config;
