/*
  Build File
*/

// Dependencies
const gulp = require("gulp");
const babel = require("@rollup/plugin-babel").babel;
const rollup = require("rollup");
const gulpiife = require("gulp-iife");
const insert = require("gulp-insert");
const mocha = require("gulp-mocha");
const fs = require("fs");

// Helpers
const licenseText = "/*" + fs.readFileSync("./LICENSE.txt", "utf8") + "\n*/\n";
// const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

function build() {
  return rollup
    .rollup({
      input: "src/modules/index.js",
      // output: {
      //   file: "src/gifshot.js",
      //   format: "iife",
      // },
      plugins: [babel({ babelHelpers: "bundled" })],
    })
    .then((bundle) => {
      return bundle.write({
        file: "src/gifshot.js",
        format: "es",
      });
    })
    .catch(console.error); // log errors;
}

function iife(cb) {
  return gulp
    .src("src/gifshot.js")
    .pipe(
      gulpiife({
        params: ["window", "document", "navigator", "undefined"],
        args: [
          'typeof window !== "undefined" ? window : {}',
          'typeof document !== "undefined" ? document : { createElement: function() {} }',
          'typeof window !== "undefined" ? window.navigator : {}',
        ],
      })
    )
    .pipe(gulp.dest("src"))
    .on("end", cb);
}

// Task that runs the Mocha unit tests and Instanbul test coverage
function test(cb) {
  gulp
    .src("tests/tests.js")
    .pipe(
      mocha({
        reporter: "nyan",
      })
    )
    .on("end", cb);
}

// Copies src/gifshot.js to dist/gifshot.js
function copy() {
  return gulp
    .src("src/gifshot.js")
    .pipe(insert.prepend(licenseText))
    .pipe(gulp.dest("dist"))
    .pipe(gulp.dest("demo/js/dependencies/"));
}

// export task "build"
exports.build = gulp.series(build, iife, test, copy);

// export task "watch"
exports.watch = function () {
  gulp.watch("src/modules/**/*.js", gulp.series(build, iife, copy));
};

