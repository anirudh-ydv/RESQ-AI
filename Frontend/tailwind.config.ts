/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'resq-bg': '#0a0f1a',
        'resq-panel': '#0f172a',
        'resq-border': '#1e293b',
        'emerald': '#10b981',
        'amber': '#f59e0b',
        'crimson': '#ef4444',
        'neon-blue': '#06b6d4',
        'neon-purple': '#a855f7',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)',
        'radial-glow': 'radial-gradient(ellipse at center, rgba(16,185,129,0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'blink': 'blink 1s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16,185,129,0.3), 0 0 40px rgba(16,185,129,0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(16,185,129,0.5), 0 0 80px rgba(16,185,129,0.2)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-hover': '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 30px rgba(16,185,129,0.2)',
        'neon-emerald': '0 0 20px rgba(16,185,129,0.4), 0 0 40px rgba(16,185,129,0.2)',
        'neon-amber': '0 0 20px rgba(245,158,11,0.4), 0 0 40px rgba(245,158,11,0.2)',
        'neon-crimson': '0 0 20px rgba(239,68,68,0.4), 0 0 40px rgba(239,68,68,0.2)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}