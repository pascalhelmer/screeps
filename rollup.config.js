'use strict';

import clear from "rollup-plugin-clear";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import replace from "rollup-plugin-replace";
import typescript from "rollup-plugin-typescript2";
import uglify from "rollup-plugin-uglify";
import screeps from "rollup-plugin-screeps";

const git = require("git-rev-sync");


let cfg;
const dest = process.env.DEST;
if (!dest) {
  console.log("No destination specified - code will be compiled but not uploaded");
} else if ((cfg = require("./screeps.json")[dest]) == null) {
  throw new Error("Invalid upload destination");
}

var bundleDest = "dist/main.js";
if (dest === "local") {
    bundleDest = cfg["dest"] + "/main.js";
}

export default {
  input: "src/main.ts",
  output: {
    file: bundleDest,
    format: "cjs",
    sourcemap: true
  },

  plugins: [
    clear({ targets: ["dist"] }),
    resolve(),
    commonjs(),
    replace({
       exclude: "node_modules/**",
       __REVISION__: JSON.stringify(git.short()),
       __REPOSITORY__: JSON.stringify("https://github.com/pascalhelmer/screeps"),
       __PROFILER_ENABLED__: JSON.stringify(true)
    }),
    typescript({tsconfig: "./tsconfig.json"}),
    (des === 'main' && uglify()),
    (dest !== 'local' && screeps({config: cfg, dryRun: cfg == null}))
  ]
}
