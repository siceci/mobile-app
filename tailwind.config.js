/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        'small': '0.875rem', // 14px
        'medium': '1rem',    // 16px
        'large': '1.25rem',  // 20px
      },
    },
  },
  plugins: [],
}
