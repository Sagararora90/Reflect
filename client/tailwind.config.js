/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rf: {
          canvas: '#0A0C10',    // Deep Dark Background (Void)
          surface: '#12151C',   // Card/Panel Background (Charcoal)
          panel: '#1E232E',     // Subtle Secondary Surface
          
          // Primary Actions (Electric Blue)
          accent: '#3B82F6',    
          'accent-muted': '#2563EB',
          'accent-light': '#60A5FA',
          'accent-glow': 'rgba(59, 130, 246, 0.2)',
          'accent-bloom': 'rgba(59, 130, 246, 0.08)',
          
          // Feedback
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          
          // Text (Optimized for Dark Mode)
          text: {
            pure: '#F8FAFC',    // Pearl White (High Contrast)
            silver: '#E2E8F0',  // Light Slate
            dim: '#94A3B8',     // Muted Blue-Gray
            muted: '#64748B',   // Darker Blue-Gray
          },

          // Borders & Glass (Dark Mode optimized)
          'border-glass': 'rgba(255, 255, 255, 0.06)',
          'border-light': 'rgba(255, 255, 255, 0.1)',
          'border-accent': 'rgba(59, 130, 246, 0.2)',
          'glass-crystal': 'rgba(18, 21, 28, 0.7)',
        }
      },
      backdropBlur: {
        xs: '2px',
        '3xl': '64px',
      },
      borderRadius: {
        'rf-sm': '12px',
        'rf-md': '16px',
        'rf-lg': '24px',
      },
      boxShadow: {
        'rf-sm': '0 2px 8px rgba(0, 0, 0, 0.2)',
        'rf-md': '0 8px 16px -4px rgba(0, 0, 0, 0.4)',
        'rf-lg': '0 20px 48px -12px rgba(0, 0, 0, 0.6)',
        'rf-crystal': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'rf-accent': '0 4px 14px 0 rgba(59, 130, 246, 0.3)',
        'rf-accent-glow': '0 0 20px rgba(59, 130, 246, 0.4)',
        'rf-input-focus': '0 0 0 4px rgba(59, 130, 246, 0.15)',
        'rf-btn-primary': '0 4px 12px rgba(59, 130, 246, 0.25)',
        'rf-btn-primary-hover': '0 8px 24px rgba(59, 130, 246, 0.4)',
      },

      animation: {
        'bloom': 'bloom 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        bloom: {
          '0%': { opacity: '0', transform: 'scale(0.98) translateY(10px)', filter: 'blur(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)', filter: 'blur(0)' },
        }
      }
    },
  },
  plugins: [],
}
