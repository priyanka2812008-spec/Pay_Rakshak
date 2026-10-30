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
        background: '#f8fafc',
        surface: '#ffffff',
        'surface-card': '#ffffff',
        'surface-card-subtle': '#f8fafc',
        'surface-border': '#e2e8f0',
        'surface-hover': '#f1f5f9',
        'primary-blue': '#2563eb',
        'accent-cyan': '#0284c7',
        'risk-allow': '#059669',
        'risk-warn': '#d97706',
        'risk-verify': '#ea580c',
        'risk-block': '#dc2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'saas-card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'saas-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'glow-allow': '0 0 20px -3px rgba(16, 185, 129, 0.25)',
        'glow-warn': '0 0 20px -3px rgba(245, 158, 11, 0.25)',
        'glow-verify': '0 0 20px -3px rgba(249, 115, 22, 0.25)',
        'glow-block': '0 0 20px -3px rgba(239, 68, 68, 0.25)',
        'glow-cyan': '0 0 20px -3px rgba(2, 132, 199, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'sweep 4s linear infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      }
    },
  },
  plugins: [],
}

