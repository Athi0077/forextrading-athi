/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#18181b', // zinc-900 (legacy)
          darker: '#09090b', // zinc-950 (legacy)
          gold: '#eab308',
          goldHover: '#ca8a04',
          gray: '#3f3f46',
          purple: '#a855f7',
          pink: '#ec4899',
          // Dynamic Theme Variables
          accent: 'var(--color-accent)',
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          text: 'var(--text-primary)',
          muted: 'var(--text-secondary)',
          border: 'var(--border-color)',
        }
      }
    },
  },
  plugins: [],
}
