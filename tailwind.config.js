/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'op-navy':   '#102A43',
        'op-blue':   '#2563EB',
        'op-green':  '#16A34A',
        'op-amber':  '#F59E0B',
        'op-red':    '#DC2626',
        'op-bg':     '#F8FAFC',
        'op-card':   '#FFFFFF',
        'op-border': '#E5E7EB',
        'op-body':   '#334155',
        'op-muted':  '#64748B',
      },
      fontFamily: {
        manrope: ['var(--font-manrope)', 'sans-serif'],
        inter:   ['var(--font-inter)',   'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,.10)',
      },
    },
  },
  plugins: [],
}
