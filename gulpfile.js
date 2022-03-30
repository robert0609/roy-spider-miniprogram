var gulp = require('gulp');
var eslint = require('gulp-eslint');
var del = require('del');

function clean() {
  return del([
    './dist/**/*'
  ]);
}

function lint() {
  return gulp.src(['./src/**/*.ts'])
    .pipe(eslint({
      fix: true
    }))
    .pipe(eslint.format('node_modules/eslint-friendly-formatter'))
    .pipe(eslint.failAfterError())
    .pipe(gulp.dest('./dist/'));
}

function lintTest() {
  return gulp.src(['./test/unit/**/*.test.ts'])
    .pipe(eslint({
      fix: true
    }))
    .pipe(eslint.format('node_modules/eslint-friendly-formatter'))
    .pipe(eslint.failAfterError())
    .pipe(gulp.dest('./dist/'));
}

exports.lint = gulp.series(lint, clean);

exports.lintTest = gulp.series(lintTest, clean);
