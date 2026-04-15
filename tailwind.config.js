/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#0a0a0a',
          900: '#1a1a1a',
          800: '#2d2d2d',
          700: '#3d3d3d',
        },
        amber: {
          350: '#ffd780',
          400: '#fbbf24',
        },
        cyan: {
          400: '#22d3ee',
        },
        ashred: {
          500: '#8b4513',
          400: '#a0522d',
        },
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-up': 'float-up 0.8s ease-out forwards',
        'scan-line': 'scan-line 8s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { textShadow: '0 0 10px rgba(251, 191, 36, 0.5)' },
          '50%': { textShadow: '0 0 20px rgba(251, 191, 36, 0.8)' },
        },
        'float-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(-40px)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}
