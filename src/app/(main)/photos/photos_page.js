module.exports = {
    darkMode: 'class', // or 'media', but 'class' is recommended for explicit toggling
    variants: {
      scrollbar: ['rounded', 'dark'], // enable dark variant for scrollbar
    },
    plugins: [
      require('tailwind-scrollbar'),