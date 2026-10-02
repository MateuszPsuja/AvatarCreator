/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@spartan-ng/brain/hlm-tailwind-preset')],
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        // Display: wonky optical serif. Body: neutral grotesque. Labels: mono.
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Archivo', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        label: ['Martian Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        // Hard edges read as cut paper; the stock default of 0.625rem reads
        // as a web card. Almost everything is square or near-square.
        none: '0',
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.25rem',
        lg: '0.375rem',
        xl: '0.5rem',
      },
      boxShadow: {
        // Offset, unblurred — a misregistered plate, not a soft glow.
        plate: '4px 4px 0 0 hsl(var(--foreground) / 0.9)',
        'plate-sm': '2px 2px 0 0 hsl(var(--foreground) / 0.9)',
        'plate-pink': '4px 4px 0 0 hsl(var(--riso-pink))',
        'plate-blue': '4px 4px 0 0 hsl(var(--riso-blue))',
      },
      keyframes: {
        'ink-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        stamp: {
          '0%': { transform: 'scale(0.9) rotate(-2deg)', opacity: '0' },
          '60%': { transform: 'scale(1.04) rotate(0.5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0)', opacity: '1' },
        },
      },
      animation: {
        'ink-in': 'ink-in 0.35s cubic-bezier(0.2, 0.8, 0.3, 1) both',
        stamp: 'stamp 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.2) both',
      },
    },
  },
  plugins: [],
};
