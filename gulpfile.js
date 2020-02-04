const gulp = require("gulp");
const minify = require("gulp-minify");
const rename = require("gulp-rename");

const JS_FILE = 'index.js';
const DEST_DIR = './min';

gulp.task('minifyjs', () => {
  console.log(`Minifying ${JS_FILE}...`);
  return gulp.src(JS_FILE, { allowEmpty: true })
    .pipe(minify({noSource: true}))
    .pipe(rename(path => {
      path.basename = path.basename.replace(/-min/,'.min');
      return path;
    }))
    .pipe(gulp.dest(DEST_DIR))
});

gulp.task('default', gulp.series(['minifyjs']));