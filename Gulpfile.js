var gulp = require('gulp');
var mocha = require('gulp-mocha');
var babel = require('gulp-babel');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var argv = require('yargs').argv;

gulp.task('clean', function () {
    return del(["dist/**/*"]);
});

gulp.task('transpile', ['clean'], function () {
    return gulp.src(['src/**/*.js', 'test/**/*.js'], {base:'.'})
        .pipe(sourcemaps.init())
        .pipe(babel({
            "presets": ["react", "es2015"]
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('test', ['transpile'], function () {
    return gulp.src('dist/test/**/*.spec.js', {read: false})
        .pipe(mocha({
            grep: argv.grep
        }))
});
