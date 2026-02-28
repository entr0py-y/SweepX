/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        s:   { 0:'#0A0A0F', 1:'#111118', 2:'#1A1A24', 3:'#1f1f2e', 4:'#252535', 5:'#2a2a40' },
        neo: {
          v: '#7c3aed',   // primary purple
          p: '#a855f7',   // highlight purple
          s: '#c084fc',   // soft purple
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
      },
      boxShadow: {
        card:       '0 2px 8px rgba(0,0,0,.5), 0 8px 24px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.05)',
        panel:      '0 4px 16px rgba(0,0,0,.6), 0 16px 48px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.04)',
        float:      '0 8px 32px rgba(0,0,0,.7), 0 32px 80px rgba(0,0,0,.45)',
        'elev-1':   '0 2px 8px rgba(0,0,0,.45), 0 4px 16px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.05)',
        'elev-2':   '0 4px 16px rgba(0,0,0,.55), 0 12px 36px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.06)',
        'elev-3':   '0 8px 32px rgba(0,0,0,.65), 0 24px 64px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.07)',
        'glow-v':     '0 0 16px rgba(124,58,237,.45), 0 0 40px rgba(124,58,237,.18)',
        'glow-p':     '0 0 16px rgba(168,85,247,.4),  0 0 40px rgba(168,85,247,.15)',
        'glow-s':     '0 0 16px rgba(192,132,252,.3),  0 0 36px rgba(192,132,252,.10)',
        'glow-soft-v':'0 0 24px rgba(124,58,237,.22), 0 0 60px rgba(124,58,237,.08)',
      },
      borderRadius: {
        '2.5xl': '1.125rem',
        '3xl':   '1.5rem',
        '4xl':   '2rem',
        'card':  '20px',
        'btn':   '16px',
      },
      backgroundImage: {
        'void-base':   'radial-gradient(ellipse 100% 70% at 60% -10%, rgba(124,58,237,.28) 0%, transparent 65%), radial-gradient(ellipse 70% 50% at 0% 70%, rgba(168,85,247,.12) 0%, transparent 60%)',
        'hero-grain':  'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
        'card-sheen':  'linear-gradient(135deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,.02) 100%)',
        'stat-bar':    'linear-gradient(90deg, #7c3aed, #a855f7)',
      },
      animation: {
        'float-a':  'float-a 7s ease-in-out infinite',
        'float-b':  'float-b 5.5s ease-in-out infinite',
        'float-c':  'float-c 9s ease-in-out infinite',
        'shimmer':  'shimmer 4s linear infinite',
        'shimbar':  'shimmer-bar 2.5s linear infinite',
        'streak':   'streak-fire 1.2s ease-in-out infinite',
        'orbit':    'orbit-dot 6s linear infinite',
        'pulse-r':  'pulse-ring 1.8s ease-out infinite',
        'scan':     'scan-line 3s ease-in-out infinite',
        'count-up': 'count-up .6s var(--ease-out) both',
        'spin-slow':'spin 12s linear infinite',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'out-expo':'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
        '26':  '6.5rem',
      },
    },
  },
  plugins: [],
}
