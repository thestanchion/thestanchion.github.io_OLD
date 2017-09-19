// Include gulp
var gulp = require('gulp'),

    sass = require('gulp-sass'),
    livereload = require('gulp-livereload'),

    scss_src = "./scss/**/",
    css_dist = "./css/";

/**************************************************
    CSS
**************************************************/

gulp.task('sass', function () {
    gulp.src(scss_src + '*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(css_dist))
        .pipe(livereload());
});

/**************************************************
    WATCHERS
**************************************************/

// Watch files for changes and run the appropriate task

gulp.task('watch_sass', function () {
    livereload.listen();
    gulp.watch(scss_src + '*.scss', ['sass']);
});


/**************************************************
    PRIMARY TASKS
**************************************************/

// Default Task - Use during build iterations
gulp.task('default', ['sass', 'watch_sass']);
