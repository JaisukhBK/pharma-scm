/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#0a0b0f',
          100: '#12131a',
          200: '#1a1b24',
          300: '#22242f',
          400: '#2a2d3a'
        },
        accent: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          teal: '#14b8a6',
          amber: '#f59e0b',
          rose: '#f43f5e'
        }
      },
      fontFamily: {
        display: ['"Satoshi"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    }
  },
  plugins: []
};
