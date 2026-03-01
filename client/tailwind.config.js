/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC', // Slate 50
        surface: '#FFFFFF',
        panel: '#F1F5F9', // Slate 100
        
        primary: {
          DEFAULT: '#4338CA', // Indigo 700
          hover: '#3730A3', // Indigo 800
          light: '#EEF2FF', // Indigo 50
        },
        
        text: {
          primary: '#0F172A', // Slate 900
          secondary: '#475569', // Slate 600
          tertiary: '#94A3B8', // Slate 400
        },
        
        border: {
          DEFAULT: '#E2E8F0', // Slate 200
          light: '#F1F5F9', // Slate 100
        },

        status: {
          success: '#10B981', // Emerald 500
          warning: '#F59E0B', // Amber 500
          danger: '#EF4444', // Red 500
          info: '#3B82F6', // Blue 500
        }
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'focus': '0 0 0 3px rgba(67, 56, 202, 0.2)', // Primary colored focus ring
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
