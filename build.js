/*
 * build.js
 * Scripts and styles compilation
 */

const fs = require("fs");
const path = require("path");
const {minify} = require("uglify-js");
const sass = require("sass");

/** Source files */
const src = {
  styles: "src/styles/main.scss",
  scripts: ["src/scripts/main.js"]
};

/** Output files prefix */
let dist = "dist/diapo";

/**
 * JS minification options
 */
const minifyOpts = {compress: {varify: false}, mangle: false};

/**
 * Build styles and scripts.
 */
function build() {
  process.stderr.write("Building...");
  // Styles
  const style = sass.renderSync({
    file: path.join(__dirname, src.styles),
    outputStyle: "compressed"
  }).css.toString("utf8").trim();
  fs.writeFileSync(path.join(__dirname, `${dist}.min.css`), style);
  // Scripts
  let script = src.scripts
    .map(s => fs.readFileSync(path.join(__dirname, s), "utf8"))
    .reduce((acc, val) => `${acc}\n${val}`);
  fs.writeFileSync(path.join(__dirname, `${dist}.min.js`), minify(script, minifyOpts).code);
  process.stderr.write(`\rBuilding... Done\n`);
}

build();
