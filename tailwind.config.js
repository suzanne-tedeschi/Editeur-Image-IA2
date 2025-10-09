/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'rose-dream': 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 25%, #f9a8d4 50%, #ec4899 75%, #be185d 100%)',
        'pink-magic': 'linear-gradient(45deg, #fff1f2, #fce7f3, #fbcfe8, #f9a8d4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'rainbow': 'rainbow 3s ease infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        rainbow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(236, 72, 153, 0.8), 0 0 60px rgba(190, 24, 93, 0.3)' },
        }
      },
      borderWidth: {
        '3': '3px',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}