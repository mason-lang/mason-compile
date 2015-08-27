'use strict'

require('source-map-support').install()
const
	babel = require('gulp-babel'),
	eslint = require('gulp-eslint'),
	header = require('gulp-header'),
	gulp = require('gulp'),
	mocha = require('gulp-mocha'),
	plumber = require('gulp-plumber'),
	sourcemaps = require('gulp-sourcemaps'),
	watch = require('gulp-watch')

const
	runTests = () => {
		gulp.src('compiled-test/**/*.js', {read: false}).pipe(mocha())
	}

gulp.task('default', [ 'watch' ])
gulp.task('all', [ 'compile', 'compile-tests', 'lint' ], runTests)

// Compile

gulp.task('compile', () => pipeCompile(gulp.src(src), 'dist'))
gulp.task('watch', () => pipeCompile(srcWatch(src), 'dist'))

gulp.task('compile-tests', () => pipeCompile(gulp.src(test), 'compiled-test'))
gulp.task('watch-compile-tests', () => pipeCompile(srcWatch(test), 'compiled-test'))

// Lint

gulp.task('lint', () =>
	gulp.src([ './gulpfile.js', src, test ]).pipe(eslint()).pipe(eslint.format()))

// Test

gulp.task('test-compile', [ 'compile-tests' ], () =>
	require('./compiled-test/test-compile').test())
gulp.task('perf-test-compile', [ 'compile-tests' ], () =>
	require('./compiled-test/test-compile').perfTest())

gulp.task('test', [ 'compile-tests' ], runTests)
gulp.task('run-tests', runTests)

// Helpers

const
	src = 'src/**/*.js',
	test = 'test/**/*.js'

const
	watchVerbose = (glob, then) => watch(glob, { verbose: true }, then),

	srcWatch = glob => gulp.src(glob).pipe(watchVerbose(glob)).pipe(plumber()),

	pipeCompile = (stream, dest) =>
		stream
		.pipe(sourcemaps.init())
		.pipe(babel({
			modules: 'amd',
			whitelist: [ 'es6.destructuring', 'es6.modules', 'strict' ]
		}))
		.pipe(header(
			'if (typeof define !== \'function\') var define = require(\'amdefine\')(module);'))
		.pipe(sourcemaps.write({ debug: true, sourceRoot: '/src' }))
		.pipe(gulp.dest(dest))
