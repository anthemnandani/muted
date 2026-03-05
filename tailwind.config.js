/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  safelist: [
    {
      pattern:
        /^bg-(blue|green|yellow|red|indigo|cyan|teal|orange|emerald|violet|sky)-[1-9]00$/,
      variants: ['hover'],
    },
    {
      pattern:
        /^text-(blue|green|yellow|red|indigo|cyan|teal|orange|emerald|violet|sky)-[1-9]00$/,
    },
    {
      pattern:
        /^border-(blue|green|yellow|red|indigo|cyan|teal|orange|emerald|violet|sky)-[1-9]00$/,
    },
    {
      pattern:
        /^(bg|border)-(blue|green|yellow|red|indigo|cyan|teal|orange|emerald|violet|sky)-[57]00\/(20|30|40|50|60|70)$/,
      variants: ['hover'],
    },
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
        'primary-2': {
          DEFAULT: 'hsl(var(--primary-2))',
          foreground: 'hsl(var(--primary-foreground-2))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        'secondary-2': {
          DEFAULT: 'hsl(var(--secondary-2))',
          foreground: 'hsl(var(--secondary-foreground-2))',
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
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        'primary-500': '#877EFF',
        'secondary-500': '#FFB620',
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
        'white-13': '#FFFFFF21',
        'white-12': '#FFFFFF1F',
        'white-8': '#FFFFFF0D',
        'white-6': '#FFFFFF0F',
        'white-4': '#FFFFFF04',
        'primary-red': '#ff3040',
        'primary-blue': '#1c8cd2',
        'border-dark': '#00000026',
        'border-light': '#f3f5f726',
        'hovered-background': 'rgba(255, 255, 255, 0.04)',
        overlay: 'rgba(84, 84, 84, 0.5)',
        'overlay-hover': '#252525b3',
        neutral: '  #fafafa',
        'neutral-2': '#ffffff52',
        'neutral-3': '#ffffff30',
        'neutral-4': '#ffffff21',
        glassmorphism: 'rgba(16, 16, 18, 0.60)',
      },
      fontSize: {
        sm: ['0.875rem', '1.1375rem'],
        base: ['1rem', '1.375rem'],
        '2xl': ['1.5rem', '1.875rem'],
      },
      width: {
        15: '60px',
        18: '72px',
        40: '160px',
        44: '176px',
      },
      height: {
        15: '60px',
        18: '72px',
      },
      maxHeight: {
        128: '40rem',
      },
      boxShadow: {
        'count-badge': '0px 0px 6px 2px rgba(219, 188, 159, 0.30)',
        'groups-sidebar': '-30px 0px 60px 0px rgba(28, 28, 31, 0.50)',
        'items-dropdown': '0 0 0 1px rgba(0, 0, 0, 0.08)',
        'setting-panel': '0px 2px 8px rgba(0, 0, 0, 0.06)',
      },
      dropShadow: {
        main: [
          '0 0 0.75px rgba(0, 0, 0, 0.42)',
          '0 1px 0.5px rgba(0, 0, 0, 0.18)',
          '0 2px 3px rgba(0, 0, 0, 0.2)',
        ],
      },
      screens: {
        '2xl': '1440px',
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
  plugins: [
    require('tailwindcss-animate'),
    require('tailwind-scrollbar'),
    require('@tailwindcss/container-queries'),
    require('tailwind-scrollbar-hide'),
    require('@tailwindcss/typography'),
  ],
};
