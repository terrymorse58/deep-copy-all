const gulp = require("gulp");
const minify = require("gulp-minify");
const rename = require("gulp-rename");

const INDEX_FILE = 'index.js';
const MINIFY_INDEX = 'minifyindex';

const LIB_FILE = 'object-library.js';
const MINIFY_LIB = 'minifylib';

const BROWSER_FILE = 'deep-copy-all.js';
const MINIFY_BROWSER = 'minifybrowser';
const DEST_DIR = './';

// minify INDEX_FILE
gulp.task(MINIFY_INDEX, () => {
  console.log(`Minifying ${INDEX_FILE}...`);
  return gulp.src(INDEX_FILE, { allowEmpty: true })
    .pipe(minify({noSource: true}))
    .pipe(rename(path => {
      path.basename = path.basename.replace(/-min/,'.min');
      return path;
    }))
    .pipe(gulp.dest(DEST_DIR))
});

// minify LIB_FILE
gulp.task(MINIFY_LIB, () => {
  console.log(`Minifying ${LIB_FILE}...`);
  return gulp.src(LIB_FILE, { allowEmpty: true })
    .pipe(minify({noSource: true}))
    .pipe(rename(path => {
      path.basename = path.basename.replace(/-min/,'.min');
      return path;
    }))
    .pipe(gulp.dest(DEST_DIR))
});

// minify MINIFY_BROWSER
gulp.task(MINIFY_BROWSER, () => {
  console.log(`Minifying ${BROWSER_FILE}...`);
  return gulp.src(BROWSER_FILE, { allowEmpty: true })
    .pipe(minify({noSource: true}))
    .pipe(rename(path => {
      path.basename = path.basename.replace(/-min/,'.min');
      return path;
    }))
    .pipe(gulp.dest(DEST_DIR))
});

gulp.task('default', gulp.series([MINIFY_INDEX, MINIFY_LIB, MINIFY_BROWSER]));