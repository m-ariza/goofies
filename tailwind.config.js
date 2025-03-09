/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{vue,js,ts}', // Path to pages
    './components/**/*.{vue,js,ts}', // Path to components
    './layouts/**/*.{vue,js,ts}', // Path to layouts
    './plugins/**/*.{js,ts}', // Path to plugins
    './nuxt.config.{js,ts}', // Include nuxt.config as well
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}