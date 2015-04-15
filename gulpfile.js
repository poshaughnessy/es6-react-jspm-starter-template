/**
 * NB. The gulpfile isn't ES6 yet - looks like we need to wait for Gulp v0.4:
 * https://github.com/gulpjs/gulp/issues/830
 */

// Enable ES6 - this will make it automatically transpile required files. See: http://babeljs.io/docs/usage/require/
require('babel/register');

// TEMP fix for this issue: https://github.com/babel/babel/issues/489
Object.getPrototypeOf.toString = function() {return Object.toString();};

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    htmlreplace = require('gulp-html-replace'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    fs = require('fs'),
    path = require('path'),
    server = require('./server'),
    Builder = require('systemjs-builder');

var paths = {
    temp: '.tmp',
    dist: 'dist'
};

/**
 * SystemJS / Babel build for distribution
 */
function buildJSDist() {

    return new Promise(function(resolve, reject) {

        var builder = new Builder();

        builder.reset();

        builder.loadConfig('./config.js')
            .then(function() {

                var hrTime = process.hrtime();
                var t1 = hrTime[0] * 1000 + hrTime[1] / 1000000;

                console.log('Building bundle...');

                // Make a Self-Executing (SFX) bundle
                builder.buildSFX('src/main', paths.dist + '/js/bundle.min.js',
                    {minify: true, sourceMaps: true})
                    .then(function() {

                        hrTime = process.hrtime();
                        var t2 = hrTime[0] * 1000 + hrTime[1] / 1000000;

                        console.log('Bundle built in ' + Math.round(t2-t1) + ' ms' );

                        resolve();

                    })
                    .catch(function(err) {
                        console.log('Error!', err);
                        reject(Error('Builder error'));
                    });
            })

    });

}

function buildSass(isDist) {

    return gulp.src('./styles/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(sourcemaps.write())
        .pipe(concat('styles.css'))
        .pipe(gulp.dest((isDist ? paths.dist : paths.temp) + '/css'));

}

/**
 *  Compile and concatenate the SCSS files into dist directory
 */
gulp.task('sass-dist', function() {
    buildSass(true);
});

/**
 *  Compile and concatenate the SCSS files into temp directory
 */
gulp.task('sass-dev', function() {
    buildSass(false);
});


/**
 * Build step for development is simply compiling the sass (we serve the JS directly from src)
 */
gulp.task('build-dev', ['sass-dev'], function() {
});

/**
 * Build JS for distribution (production / production testing)
 */
gulp.task('build-dist', function() {

    return buildJSDist(true).then(function() {

        gulp.src('src/index.html')
            .pipe(htmlreplace(({
                'css': 'css/styles.css',
                'jsHead': 'js/bundle.min.js',
                'jsBody': ''
            })))
            .pipe(gulp.dest(paths.dist));

    });

});

/**
 * Compile and watch for changes
 */
gulp.task('watch', ['build-dev'], function() {
    gulp.watch('./styles/*.scss', ['sass-dev']);
});

/**
 * Compile and start watching, then start the development server
 * (Production doesn't use gulp for the server, just for building beforehand).
 */
gulp.task('serve', ['watch'], function() {
    server.start();
});

/**
 * By default, runs the dev build task
 */
gulp.task('default', ['build-dev'], function() {
});
