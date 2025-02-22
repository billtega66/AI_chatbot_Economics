/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        colors: {
          // Custom colors for your project (optional)
          yellow: {
            DEFAULT: "#FFD700",
            500: "#FFD700"
          },
        },
      },
    },
    plugins: [],
  };
  