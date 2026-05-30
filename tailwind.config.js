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
        // ── Core surfaces ────────────────────────────────────────────
        'op-bg':       '#F9F7F4',   // warm paper white — main bg
        'op-surface':  '#FFFFFF',   // card / modal surfaces
        'op-surface-2':'#F2EEE8',   // alternate section bg (slightly warmer)
        'op-dark':     '#1A1008',   // near-black warm ink — dark sections
        'op-dark-2':   '#241C13',   // slightly lighter dark for depth

        // ── Text ─────────────────────────────────────────────────────
        'op-ink':      '#1A1008',   // primary headings & dark text
        'op-body':     '#4A3F35',   // body copy
        'op-muted':    '#7A6E65',   // secondary / helper text
        'op-subtle':   '#A09288',   // placeholders, very light labels

        // ── Borders ──────────────────────────────────────────────────
        'op-border':   '#E4DDD5',   // warm tan border

        // ── Brand accents ────────────────────────────────────────────
        'op-accent':   '#D4622A',   // terracotta — primary CTA accent
        'op-accent-dk':'#A84D20',   // hover / pressed state

        // ── Semantic ─────────────────────────────────────────────────
        'op-forest':   '#2A5F4E',   // deep green — success, money, growth
        'op-amber':    '#C2720A',   // warm amber — warnings, highlights
        'op-red':      '#C23B22',   // warm red — errors, danger
        'op-teal':     '#3B6E8C',   // cool teal — info accent

        // ── Legacy aliases (backward-compat with auth/scanner/legal pages)
        'op-navy':     '#1A1008',
        'op-primary':  '#1A1008',
        'op-blue':     '#3B6E8C',
        'op-green':    '#2A5F4E',
        'op-card':     '#FFFFFF',

        // ── ImageCard / neobrutalist token bridge ────────────────────
        // Remapped to Operon palette so they read as editorial, not harsh
        'main':          'var(--main)',
        'overlay':       'var(--overlay)',
        'bw':            'var(--bw)',
        'blank':         'var(--blank)',
        'mtext':         'var(--mtext)',
        'secondaryBlack':'#212121',
      },

      fontFamily: {
        fraunces:  ['var(--font-fraunces)',  'Georgia', 'serif'],
        jakarta:   ['var(--font-jakarta)',   'sans-serif'],
        // legacy aliases so existing pages don't break
        manrope:   ['var(--font-fraunces)',  'Georgia', 'serif'],
        inter:     ['var(--font-jakarta)',   'sans-serif'],
      },

      fontSize: {
        'display-2xl': ['4.5rem',  { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-xl':  ['3.75rem', { lineHeight: '1.06', letterSpacing: '-0.02em' }],
        'display-lg':  ['3rem',    { lineHeight: '1.1',  letterSpacing: '-0.015em' }],
        'display-md':  ['2.25rem', { lineHeight: '1.2',  letterSpacing: '-0.01em' }],
        'display-sm':  ['1.875rem',{ lineHeight: '1.25', letterSpacing: '-0.01em' }],
      },

      boxShadow: {
        'card':       '0 1px 4px 0 rgba(26,16,8,.06), 0 1px 2px -1px rgba(26,16,8,.05)',
        'card-hover': '0 8px 24px 0 rgba(26,16,8,.10), 0 2px 8px -2px rgba(26,16,8,.08)',
        'card-lg':    '0 16px 48px 0 rgba(26,16,8,.12)',
        'glow-accent':'0 0 40px 0 rgba(212,98,42,.15)',
        'glow-forest':'0 0 40px 0 rgba(42,95,78,.12)',
        'shadow':     'var(--shadow)',   // ImageCard neobrutalist token
      },
      translate: {
        'boxShadowX':        '4px',
        'boxShadowY':        '4px',
        'reverseBoxShadowX': '-4px',
        'reverseBoxShadowY': '-4px',
      },
      fontWeight: {
        'base':    '500',
        'heading': '700',
      },

      borderRadius: {
        'base': '5px',      // ImageCard neobrutalist token
        'xl':   '0.875rem',
        '2xl':  '1.25rem',
        '3xl':  '1.75rem',
      },

      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(0.85)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },

      animation: {
        'fade-up':    'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in':    'fade-in 0.5s ease forwards',
        'pulse-dot':  'pulse-dot 2s ease-in-out infinite',
        'shimmer':    'shimmer 2.5s linear infinite',
        'float':      'float 4s ease-in-out infinite',
      },

      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
