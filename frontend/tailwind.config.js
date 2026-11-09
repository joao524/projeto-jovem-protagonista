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
      }
    },
  },
  plugins: [],
}
