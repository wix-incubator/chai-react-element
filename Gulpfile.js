var gulp = require('gulp');
var mocha = require('gulp-mocha');
var babel = require('gulp-babel');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var argv = require('yargs').argv;
var watch   = require("gulp-watch");
var WebpackDevServer = require("webpack-dev-server");
var gutil = require("gulp-util");
var webpack = require("webpack");

var sources = ['src/**/*.js', 'test/**/*.js'];

gulp.task('clean', function () {
    return del(["dist/**/*"]);
});

gulp.task('transpile', ['clean'], function () {
    return gulp.src(sources, {base:'.'})
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

gulp.task("watch", ["transpile"], function () {
    watch(sources, function () {
        gulp.start("test");
    });
});

gulp.task("dev", ["watch"], function() {
    // Start a webpack-dev-server
    var compiler = webpack(require('./webpack.config'));

    new WebpackDevServer(compiler, {
        // server and middleware options
    }).listen(8080, "localhost", function(err) {
        if(err) throw new gutil.PluginError("webpack-dev-server", err);
        gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");
    });
});