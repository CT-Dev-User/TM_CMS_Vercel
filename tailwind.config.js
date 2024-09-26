/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    // If using a `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
    
  theme: {
    extend: {},
    screens: {
      'sm': {'max': '639px'},
      'md': {'max': '820px'},
      'lg': {'max': '1023px'},
      'xl': {'max': '1279px'}, 
      '2xl': {'max': '1535px'}, 
    }
  },
  plugins: [],
}
