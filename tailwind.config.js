/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },

    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'primary-500': '#877EFF',
        'secondary-500': '#FFB620',
        blue: '#0095F6',
        'logout-btn': '#FF5A5A',
        'navbar-menu': 'rgba(16, 16, 18, 0.6)',
        'dark-1': '#000000',
        'dark-2': '#121417',
        'dark-3': '#101012',
        'dark-4': '#1F1F22',
        'light-1': '#FFFFFF',
        'light-2': '#EFEFEF',
        'light-3': '#7878A3',
        'light-4': '#5C5C7B',
        'gray-1': '#d5d5d5',
        'gray-2': '#ccc',
        'gray-3': '#777',
        'gray-4': '#424242',
        'gray-5': '#2d2d2d',
        'gray-6': '#181818',
        'gray-7': '#393939',
        'primary-red': '#ff3040',
        'border-dark': '#00000026',
        'border-light': '#f3f5f726',
        'hovered-background': 'rgba(255, 255, 255, 0.04)',
        glassmorphism: 'rgba(16, 16, 18, 0.60)',
      },
      width: {
        15: '60px',
      },
      maxHeight: {
        128: '40rem',
      },
      boxShadow: {
        'count-badge': '0px 0px 6px 2px rgba(219, 188, 159, 0.30)',
        'groups-sidebar': '-30px 0px 60px 0px rgba(28, 28, 31, 0.50)',
        'items-dropdown': '0 0 0 1px rgba(0, 0, 0, 0.08)',
      },
      screens: {
        xs: '400px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
