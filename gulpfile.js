'use strict';

// Load plugins
const autoprefixer = require('gulp-autoprefixer'),
    browsersync = require('browser-sync').create(),
    cleanCSS = require('gulp-clean-css'),
    // del = require('del'),
    gulp = require('gulp'),
    // header = require('gulp-header'),
    // merge = require('merge-stream'),
    // plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    // sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    babel = require('gulp-babel'),
    minihtml = require('gulp-htmlmin'),
    uglify = require('gulp-uglify');

// Relative paths function
const pathsConfig = function () {
    let root = __dirname;
    // let dist = root + '/static';
    let cssFolder = root + '/css';
    // let scssFolder = root + '/scss';
    let jsFolder = root + '/js';

    return {
        root: root,
        html: root + '/*.html',
        cssDir: cssFolder,
        css: cssFolder + '/*.css',
        cssMin: cssFolder + '/*.min.css',
        // scssDir: scssFolder,
        // scss: scssFolder + '/**/*.scss',
        jsDir: jsFolder,
        js: jsFolder + '/*.js',
        jsMin: jsFolder + '/*.min.js',
        // dist: dist,
        // vendor: dist + '/vendor',
        // js9Target: dist + '/vendor/js9',
        prod: root + '/docs',
    }
};

const paths = pathsConfig();


// Debug task
function debug(cb) {
    console.log(paths)
    return cb();
}

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./"
        },
        port: 4321
    });
    done();
}

// BrowserSync reload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

// CSS task
function cssTaskDev() {
    return gulp
        .src([
            paths.css,
            '!' + paths.cssMin,
        ])
        .pipe(sourcemaps.init())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('map'))
        .pipe(gulp.dest(paths.cssDir))
        .pipe(browsersync.stream());
}

function cssTaskProd() {
    return gulp.src([
        paths.css,
        '!' + paths.cssMin,
    ])
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(cleanCSS())
        .pipe(gulp.dest(paths.prod + '/css'));
}

function cssMinTaskProd() {
    return gulp.src(paths.cssMin)
        .pipe(gulp.dest(paths.prod + '/css'));
}

// JS task
function jsTaskDev() {
    return gulp
        .src([
            paths.js,
            '!' + paths.jsMin,
        ])
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        // .pipe(header(banner, {
        //   pkg: pkg
        // }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('map'))
        .pipe(gulp.dest(paths.jsDir))
        .pipe(browsersync.stream());
}

// JS task
function jsTaskProd() {
    return gulp
        .src([
            paths.js,
            '!' + paths.jsMin,
        ])
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.prod + '/js'));
}

function jsMinTaskProd() {
    return gulp
        .src(paths.jsMin)
        .pipe(gulp.dest(paths.prod + '/js'));
}

function minifyHtml() {
    return gulp.src(paths.html)
        .pipe(minihtml({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest(paths.prod));
}

// Watch files
function watchFiles() {
    // gulp.watch("./css/**/*", cssTaskDev);
    // gulp.watch([paths.js, '!' + paths.jsMin], jsTaskDev);
    gulp.watch("./*.html", browserSyncReload);
}

// Define complex tasks
// const vendor = gulp.series(clean, modules);
// const build = gulp.series(vendor, gulp.parallel(css, js));
// const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));
const watch = gulp.parallel(watchFiles, browserSync);
const prod = gulp.parallel(
    minifyHtml,
    gulp.series(jsMinTaskProd, jsTaskProd),
    gulp.series(cssMinTaskProd, cssTaskProd),
)

// Export tasks
// exports.css = css;
// exports.js = js;
// exports.clean = clean;
// exports.vendor = vendor;
// exports.build = build;
// exports.watch = watch;
exports.debug = debug;
exports.default = watch;
exports.prod = prod;
