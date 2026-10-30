/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Editorial Retrô Revolucionário / Pôster Vintage
        retro: {
          bg: '#F6F2E9',          // Fundo papel antigo / marfim quente
          bgWarm: '#FAF7F0',      // Creme claro
          paper: '#FFFDF9',       // Papel puro
          card: '#FFFFFF',        // Branco limpo para cards
          border: '#1E1E1E',      // Borda preta sólida de alto contraste
          borderSoft: '#403D39',  // Borda suave de contraste
          ink: '#141414',         // Preto tipográfico
          inkMuted: '#57534E',    // Cinza quente legível
        },
        rev: {
          // Vermelho revolucionário vibrante
          red: '#D62828',
          redDark: '#9E2A2B',
          redLight: '#FDF0ED',
          redBorder: '#B71C1C',
          // Verde Militar / Oliva profundo
          olive: '#283618',
          oliveDark: '#1E2812',
          oliveLight: '#EDF2E8',
          oliveBorder: '#384B22',
          // Dourado / Mostarda vintage
          gold: '#BC6C25',
          goldLight: '#FDF4EB',
          mustard: '#DDA15E',
          star: '#E79E3C',
          // Preto de alto contraste
          black: '#141414',
          charcoal: '#1E1E1E',
        },
        comrade: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#D62828', // Vermelho revolucionário
          700: '#9E2A2B',
          800: '#801A1B',
          900: '#5C1314',
        }
      },
      fontFamily: {
        headline: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Lora', 'Georgia', 'serif'],
        serif: ['"Playfair Display"', 'Lora', 'Georgia', 'serif'],
        reading: ['Lora', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'solid': '3px 3px 0px 0px #1E1E1E',
        'solid-sm': '2px 2px 0px 0px #1E1E1E',
        'solid-md': '4px 4px 0px 0px #1E1E1E',
        'solid-lg': '6px 6px 0px 0px #1E1E1E',
        'solid-xl': '8px 8px 0px 0px #1E1E1E',
        'solid-red': '4px 4px 0px 0px #9E2A2B',
        'solid-olive': '4px 4px 0px 0px #283618',
        'solid-gold': '4px 4px 0px 0px #BC6C25',
      },
      animation: {
        'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.95)' },
          '70%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        }
      }
    },
  },
  plugins: [],
}
