/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/views/**/*.{html,ejs}"],
    theme: {
        extend: {
            colors: {}
        }
    },
    plugins: [
        require("@tailwindcss/aspect-ratio"),
        require("@tailwindcss/typography")
    ]
}
