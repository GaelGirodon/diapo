/*
 * build.js
 * Scripts and styles compilation
 */

const fs = require("fs");
const { join } = require("path");
const { minify } = require("uglify-js");
const sass = require("sass");

/** Source files */
const src = {
  styles: "src/styles/main.scss",
  scripts: ["src/scripts/main.js"]
};

/** Output files */
const dist = {
  /** Output directory path */
  dir: join(__dirname, "dist"),
  /** Output files name */
  file: "diapo"
};

/**
 * JS minification options
 */
const minifyOpts = { compress: { varify: false }, mangle: false };

/**
 * Build styles and scripts.
 */
function build() {
  process.stderr.write("Building...");
  fs.mkdirSync(dist.dir, { recursive: true });
  // Styles
  const style = sass.compile(join(__dirname, src.styles), {
    style: "compressed"
  }).css.toString("utf8").trim();
  fs.writeFileSync(join(dist.dir, `${dist.file}.min.css`), style);
  // Scripts
  let script = src.scripts
    .map(s => fs.readFileSync(join(__dirname, s), "utf8"))
    .reduce((acc, val) => `${acc}\n${val}`);
  fs.writeFileSync(join(dist.dir, `${dist.file}.min.js`), minify(script, minifyOpts).code);
  process.stderr.write(`\rBuilding... Done\n`);
}

build();
