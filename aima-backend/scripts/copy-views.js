const fs = require("fs-extra")

// Copy EJS files from source directory to dist directory
fs.copySync("src/views", "dist/views")
