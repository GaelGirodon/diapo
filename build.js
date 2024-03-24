/*
 * build.js
 * Scripts and styles compilation
 */

import fs from "node:fs";
import { join } from "node:path";
import * as sass from "sass";
import * as terser from "terser";

/** Source files */
const src = {
  styles: join(import.meta.dirname, "src/styles/main.scss"),
  scripts: [
    join(import.meta.dirname, "src/scripts/main.js")
  ]
};

/** Output files */
const dist = {
  /** Output directory path */
  dir: join(import.meta.dirname, "dist"),
  /** Output files name */
  file: "diapo"
};

/*
 * Build styles and scripts
 */

process.stderr.write("Building...");
fs.mkdirSync(dist.dir, { recursive: true });

// Styles
const style = sass.compile(src.styles, { style: "compressed" }).css.trim();
fs.writeFileSync(join(dist.dir, `${dist.file}.min.css`), style, "utf8");

// Scripts
let script = src.scripts
  .map(s => fs.readFileSync(s, "utf8"))
  .reduce((acc, val) => `${acc}\n${val}`);
script = (await terser.minify(script, { mangle: false })).code;
fs.writeFileSync(join(dist.dir, `${dist.file}.min.js`), script, "utf8");

process.stderr.write(`\rBuilding... Done\n`);
