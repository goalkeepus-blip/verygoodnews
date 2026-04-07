import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          dark: '#0B2A1A',
          bg: '#E8F5EE',
          accent: '#4ADE80',
          muted: '#6EAA8A',
          border: '#d0e8da',
        },
      },
      fontFamily: {
        serif: ['Noto Serif KR', 'serif'],
        sans: ['Noto Sans KR', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
