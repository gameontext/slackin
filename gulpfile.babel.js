import gulp from 'gulp';
import babel from 'gulp-babel';
import rimraf from 'gulp-rimraf';
import mocha  from 'gulp-mocha';
import eslint from 'gulp-eslint';

const paths = {
  in: {
    js: 'lib/*.js',
    assets: 'lib/assets/*'
  },
  out: {
    js: 'dist',
    assets: 'dist/assets'
  }
}

gulp.task('transpile', () => {
  return gulp.src(paths.in.js)
  .pipe(babel())
  .pipe(gulp.dest(paths.out.js))
})

gulp.task('assets', () => {
  return gulp.src(paths.in.assets)
  .pipe(gulp.dest(paths.out.assets))
})

gulp.task('clean', () => {
  return gulp.src(paths.out.js, {
    read: false
  })
  .pipe(rimraf())
})

gulp.task('mocha', () => {
  return gulp.src(['test/**/test-*.js'], {read: false})
    .pipe(mocha({
        reporter: 'spec', 
        require: [
          '@babel/register',
          'test/setup.js'
        ]
      }));
})

gulp.task('eslint', () => {
  return gulp.src(paths.in.js)
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError());
})

gulp.task('default', gulp.series('transpile', 'assets'))
gulp.task('test', gulp.series('mocha', 'eslint'))