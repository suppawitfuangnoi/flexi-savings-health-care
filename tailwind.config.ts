import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.vue',
    './components/**/*.vue',
    './layouts/**/*.vue',
    './app.vue',
    './error.vue',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'Roboto',
          "'Noto Sans Thai'", "'IBM Plex Sans Thai'", 'system-ui', 'sans-serif',
        ],
      },
      colors: {
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          light:      'hsl(var(--primary-light))',
          dark:       'hsl(var(--primary-dark))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        // Bangkok Life Assurance brand palette
        bkk: {
          navy:          '#1A2B4A',
          royal:         '#0066B3',
          'royal-hover': '#005299',
          white:         '#FFFFFF',
          'gray-bg':     '#F5F5F5',
        },
        ecm: {
          maturity: '#2E5AAC',
          paid:     '#0A8A4C',
          coupon:   '#E67E22',
        },
        status: {
          birthday:  '#7C3AED',
          privilege: '#D97706',
        },
        'border-standard': '#E2E8F0',
        'border-selected': '#2563EB',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'bkk-card':       '0 2px 8px rgba(0,0,0,0.06)',
        'bkk-card-hover': '0 4px 12px rgba(0,0,0,0.10)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
