/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ttnb: {
          blue: '#07395c',       // Azul Marinho Náutico TTNB
          dark: '#23506f',       // Azul Oceano Profundo
          teal: '#318a91',       // Verde Água / Ciano Maré
          orange: '#ed7837',     // Laranja Solar Náutico
          mint: '#ecf5f0',       // Fundo Suave Verde Alerta
          mintCard: '#edf5f2',   // Fundo Seletor Destinos
          bg: '#fffefa',         // Fundo Geral Off-White
          gold: '#aa752d',       // Estrelas e Destaque
          muted: '#615f5e',      // Textos descritivos secundários
          subtle: '#887878',     // Subtítulos e notas
          border: '#cfcfcf',     // Bordas de inputs e cards
          dash: '#d3caca',       // Linhas tracejadas
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'ttnb-btn': '5px',
        'ttnb-card': '7px',
      },
      // Utilitários usados no código que NÃO existem no Tailwind v3 por padrão
      // (sintaxe do Tailwind v4 / tailwindcss-animate). Sem estas definições,
      // as classes eram descartadas silenciosamente no build.
      boxShadow: {
        '2xs': '0 1px 1px 0 rgb(15 23 42 / 0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
      scale: {
        98: '0.98',
      },
      borderWidth: {
        3: '3px',
      },
      spacing: {
        88: '22rem',
      },
      keyframes: {
        'ttnb-fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'ttnb-slide-in-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'ttnb-zoom-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'ttnb-shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
