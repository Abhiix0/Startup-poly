/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eqx: {
          bg: '#111111',
          card: '#1C1C1E',
          cardElevated: '#242426',
          surface: '#2C2C2E',
          blue: '#7484FE',
          blueHover: '#6070EE',
          blueDim: 'rgba(116, 132, 254, 0.12)',
          green: '#33FF67',
          greenHover: '#29E058',
          greenDim: 'rgba(51, 255, 103, 0.12)',
          white: '#F7F2F6',
          muted: '#8E8E93',
          subtle: '#636366',
          border: 'rgba(255, 255, 255, 0.07)',
          borderHover: 'rgba(255, 255, 255, 0.15)',
          danger: '#FF453A',
          dangerDim: 'rgba(255, 69, 58, 0.12)',
          amber: '#FFD60A',
          amberDim: 'rgba(255, 214, 10, 0.12)',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SF Mono', 'JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
        '3xl': '22px',
        '4xl': '28px',
      },
      boxShadow: {
        'card': '0 4px 24px -2px rgba(0, 0, 0, 0.45)',
        'float': '0 12px 32px -4px rgba(0, 0, 0, 0.65)',
        'glow-blue': '0 0 20px -2px rgba(116, 132, 254, 0.25)',
        'glow-green': '0 0 20px -2px rgba(51, 255, 103, 0.25)',
      },
      screens: {
        'xs': '390px',
      }
    },
  },
  plugins: [],
}
