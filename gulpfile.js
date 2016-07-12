/*es-lint no-process-env: "off"*/
const path      = require('path');
const gulp      = require('gulp');
const mocha     = require('gulp-mocha');
const eslint    = require('gulp-eslint');
const istanbul  = require('gulp-istanbul');
const coveralls = require('gulp-coveralls');

gulp.task('test:dirty', ()=> {
  return gulp.src('test.js')
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('pre-test', ()=> {
  return gulp.src([
    'index.js',
    'options.js'
  ])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('test:coverage', ['pre-test'], ()=> {
  return gulp.src(['test.js'])
    .pipe(mocha({reporter: 'spec'}))
    .pipe(istanbul.writeReports({
      reporters: [
        'text',
        'html',
        'lcov'
      ]
    }))
    .pipe(istanbul.enforceThresholds({thresholds: {global: 70}}))
    .once('error', () => {
      console.error('coverage failed');
      process.exit(1);
    });
});

const lint = ()=> {
  return gulp.src([
    '**/*.js',
    '!node_modules/**',
    '!coverage/**'
  ])
    .pipe(eslint({
      fix: true
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .once('error', () => {
      console.error('lint failed');
      process.exit(1);
    })
    .once('end', () => {
      process.exit();
    });
};

gulp.task('test:lint', ['test:coverage'], ()=> {
  return lint();
});

gulp.task('lint', ()=> {
  return lint();
});

gulp.task('test', ['test:lint']);

gulp.task('coveralls', ['test'], () => {
  if (!process.env.CI) {
    return;
  }

  return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
    .pipe(coveralls());
});