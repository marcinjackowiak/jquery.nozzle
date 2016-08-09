var gulp = require('gulp'),
    gulpUtil = require('gulp-util'),
    gulpConcat = require('gulp-concat'),
    gulpUglify = require('gulp-uglify'),
    gulpSourcemaps = require('gulp-sourcemaps'),
    gulpStripDebug = require('gulp-strip-debug')
    gulpExpect = require('gulp-expect-file');

gulp.task('default', ['js','jsmin']);

/**
 * JS
 */
gulp.task('js', function() {
    
	var sources = ['src/**/*.js'];

	return gulp.src(sources)	
                .pipe(gulpExpect(sources))
                .pipe(gulpSourcemaps.init())                
                .pipe(gulpConcat('jquery.nozzle.js'))
                .pipe(gulpStripDebug())
                .pipe(gulp.dest('./dist'));    
    
});

/**
 * Minify JS
 */
gulp.task('jsmin', function() {
    
	var sources = ['src/**/*.js'];

	return gulp.src(sources)	
                .pipe(gulpExpect(sources))
                .pipe(gulpSourcemaps.init())                
                .pipe(gulpConcat('jquery.nozzle.min.js'))
                .pipe(gulpStripDebug())
                .pipe(gulpUglify({
                        mangle: true,
                        source_map: 'source_map'
                }).on('error', gulpUtil.log))				
                .pipe(gulpSourcemaps.write('./'))
                .pipe(gulp.dest('./dist'));    
    
});

