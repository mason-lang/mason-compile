'use strict'

require('source-map-support').install()
const
	babel = require('gulp-babel'),
	header = require('gulp-header'),
	gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	sourcemaps = require('gulp-sourcemaps'),
	watch = require('gulp-watch')

gulp.task('compile', ['compile', 'compile-tests'])

// Compile

gulp.task('compile', () => pipeCompile(gulp.src(src), 'dist'))
gulp.task('watch', () => pipeCompile(srcWatch(src), 'dist'))

gulp.task('compile-tests', () => pipeCompile(gulp.src(test), 'compiled-test'))
gulp.task('watch-compile-tests', () => pipeCompile(srcWatch(test), 'compiled-test'))

// Test

gulp.task('test-compile', ['compile-tests'], () => {
	require('./compiled-test/test-compile').test()
})
gulp.task('perf-test-compile', ['compile-tests'], () => {
	require('./compiled-test/test-compile').perfTest()
})

// Helpers

const
	src = 'src/**/*.js',
	test = 'test/**/*.js'

const
	watchVerbose = (glob, then) => watch(glob, {verbose: true}, then),

	srcWatch = glob => gulp.src(glob).pipe(watchVerbose(glob)).pipe(plumber()),

	pipeCompile = (stream, dest) =>
		stream
		.pipe(sourcemaps.init())
		.pipe(babel({
			modules: 'amd',
			whitelist:
				['es6.destructuring', 'es6.modules', 'es6.parameters', 'es6.spread', 'strict']
		}))
		.pipe(header(
			'if (typeof define !== \'function\') var define = require(\'amdefine\')(module);'))
		.pipe(sourcemaps.write({debug: true, sourceRoot: '/src'}))
		.pipe(gulp.dest(dest))
