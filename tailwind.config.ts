import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "surface-container": "#efeeea",
        "tertiary-container": "#d4bdd3",
        "on-primary-container": "#43554e",
        "error-container": "#ffdad6",
        "primary-fixed": "#d3e7de",
        "on-secondary-fixed": "#241a07",
        "error": "#ba1a1a",
        "secondary-fixed": "#f3e0c2",
        "tertiary-fixed-dim": "#d7bfd6",
        "secondary": "#6a5d45",
        "on-surface-variant": "#424845",
        "on-tertiary-container": "#5d4b5e",
        "surface-variant": "#e3e2df",
        "on-tertiary": "#ffffff",
        "background": "#faf9f5",
        "outline-variant": "#c2c8c4",
        "inverse-on-surface": "#f2f1ed",
        "surface-container-lowest": "#ffffff",
        "surface-bright": "#faf9f5",
        "surface": "#faf9f5",
        "on-surface": "#1b1c1a",
        "on-primary-fixed": "#0d1f19",
        "on-tertiary-fixed-variant": "#524153",
        "surface-container-high": "#e9e8e4",
        "on-secondary": "#ffffff",
        "surface-dim": "#dbdad6",
        "on-primary": "#ffffff",
        "tertiary-fixed": "#f3dbf2",
        "on-tertiary-fixed": "#251727",
        "on-secondary-fixed-variant": "#51452f",
        "secondary-fixed-dim": "#d6c4a7",
        "secondary-container": "#f0ddbf",
        "on-primary-fixed-variant": "#394a44",
        "on-error": "#ffffff",
        "outline": "#737875",
        "surface-container-low": "#f4f4f0",
        "on-background": "#1b1c1a",
        "inverse-primary": "#b7cbc2",
        "surface-tint": "#50625b",
        "tertiary": "#6b596b",
        "primary-fixed-dim": "#b7cbc2",
        "on-error-container": "#93000a",
        "on-secondary-container": "#6f6149",
        "primary-container": "#b5c9c0",
        "inverse-surface": "#2f312e",
        "surface-container-highest": "#e3e2df",
        "primary": "#50625b"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
      },
      spacing: {
        "margin-desktop": "80px",
        "gutter": "24px",
        "stack-md": "32px",
        "stack-lg": "64px",
        "margin-mobile": "20px",
        "stack-sm": "16px"
      },
      fontFamily: {
        "bodoni": ["var(--font-bodoni)"],
        "dm-sans": ["var(--font-dm-sans)"],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}

export default config