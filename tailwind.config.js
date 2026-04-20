/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        milk: '#fffaf5',
        cotton: '#fdf2ee',
        blush: '#ffd9dd',
        sakura: '#ffbac3',
        rose: '#f48fa0',
        ash: '#b8b3b0',
        ink: '#3a3330',
        sparkle: '#ffe08a',
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'system-ui', 'sans-serif'],
        display: ['"Zen Maru Gothic"', '"Noto Sans JP"', 'sans-serif'],
        handwritten: ['"Klee One"', '"Zen Maru Gothic"', 'cursive'],
      },
      boxShadow: {
        soft: '0 6px 20px rgba(255, 186, 195, 0.25)',
        pop: '0 10px 30px rgba(244, 143, 160, 0.35)',
        glass:
          'inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -1px 0 rgba(255,255,255,0.15), inset 1px 0 0 rgba(255,255,255,0.35), inset -1px 0 0 rgba(255,255,255,0.2), 0 8px 24px rgba(244,143,160,0.18)',
        'glass-chip':
          'inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(255,255,255,0.12), 0 2px 6px rgba(244,143,160,0.12)',
        'glass-lg':
          'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(255,255,255,0.18), 0 12px 32px rgba(163,135,212,0.22)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        rise: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '10%': { opacity: '0.9' },
          '100%': { transform: 'translateY(-120vh) translateX(var(--drift, 0px))', opacity: '0' },
        },
        sway: {
          '0%, 100%': { transform: 'translateX(0) rotate(-2deg)' },
          '50%': { transform: 'translateX(4px) rotate(2deg)' },
        },
        popin: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        floaty: 'floaty 4s ease-in-out infinite',
        twinkle: 'twinkle 2.4s ease-in-out infinite',
        rise: 'rise var(--rise-duration, 14s) linear infinite',
        sway: 'sway 5s ease-in-out infinite',
        popin: 'popin 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      },
    },
  },
  plugins: [],
}
