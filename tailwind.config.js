/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#04070D',
          900: '#060B14', // Mission control dark background
          850: '#09101E',
          800: '#0D1524', // Telemetry panel background
          750: '#131F35',
          700: '#1B2B48',
          600: '#2A3F66',
        },
        nasa: {
          cyan: '#38BDF8',
          flame: '#F97316',
          cool: '#6366F1',
          hazard: '#EF4444',
          amber: '#F59E0B',
          emerald: '#10B981',
        }
      },
      fontFamily: {
        sans: ['"Inter"', '"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
        display: ['"Space Grotesk"', '"Inter"', 'sans-serif'],
      },
      borderColor: {
        telemetry: 'rgba(56, 189, 248, 0.15)',
        'telemetry-bright': 'rgba(56, 189, 248, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glowPulse: {
          '0%': { filter: 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}
