var gulp = require('gulp'),
    concat = require('gulp-concat'),
    intercept = require('gulp-intercept'),
    wrapper = require('gulp-wrapper'),
    clean = require('gulp-clean'),
    sync = require('gulp-sync')(gulp),
    webpack = require('webpack-stream'),
    webserver = require('gulp-webserver');

gulp.task('default', sync.sync([
    [
        ['styles', 'scripts', 'copy-maps'],
        'clean-temp'
    ],
    'webserver'
    ]), function() {});

gulp.task('styles', function() {
    return gulp.src([
        'bower_components/bootstrap/dist/css/bootstrap.css',
        'modules/**/*.css'
    ])
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('build'));
});

gulp.task('scripts', ['build-webpack', 'templates'], function() {
    return gulp.src(['temp/main.js', 'temp/templates.js'])
        .pipe(concat('main.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('copy-maps', function() {
    return gulp.src(['temp/main.js.map'])
        .pipe(gulp.dest('build'));
});

gulp.task('build-webpack', function() {
    return gulp.src(['modules/index.js'])
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('temp'));
});

gulp.task('templates', function() {
     return gulp.src(['modules/**/*.html'])
        .pipe(intercept(function(file) {
            file.contents = new Buffer(JSON.stringify(file.contents.toString()));
            return file;
        }))
        .pipe(wrapper({
            header: 'document.write(',
            footer: ');\n'
        }))
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('temp'));
});

gulp.task('webserver', function() {
/*    gulp.src(__dirname)
        .pipe(webserver({
            open: true,
            fallback: 'index.html'
        }));*/
});

gulp.task('clean-temp', function() {
    return gulp.src('temp')
        .pipe(clean());
});