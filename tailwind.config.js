/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Vert profond inspiré de l'identité Residence Inn
        brand: {
          50: '#eef5f1',
          100: '#d3e6dc',
          200: '#a8ccb9',
          300: '#7ab296',
          400: '#4f9877',
          500: '#2f7d5c',
          600: '#1f6349',
          700: '#164a37',
          800: '#0f3527',
          900: '#0a2419',
        },
        // Doré chaleureux pour les accents "hospitalité"
        gold: {
          50: '#fbf7ee',
          100: '#f3e7cb',
          200: '#e6cf9c',
          300: '#d8b76d',
          400: '#c9a04a',
          500: '#b3893a',
          600: '#8f6d2e',
        },
        // Bordeaux Marriott Bonvoy, utilisé uniquement pour l'encart fidélité
        bonvoy: {
          400: '#a13a49',
          500: '#8a2432',
          600: '#6e1c28',
        },
      },
      fontFamily: {
        serif: ['var(--font-display)', 'ui-serif', 'Georgia', 'serif'],
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ticket: '0 20px 45px -15px rgba(15, 53, 39, 0.35)',
      },
    },
  },
  plugins: [],
};
