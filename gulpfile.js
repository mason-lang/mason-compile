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
		gulp.src('compiled-test/**/*.js', {read: false})
		.pipe(mocha())
	}

gulp.task('default', [ 'watch' ])
gulp.task('all', [ 'compile', 'compile-tests', 'lint' ], runTests)

// Compile

gulp.task('compile', () => pipeCompile(gulp.src(src)))
gulp.task('watch', () => pipeCompile(srcWatch(src)))

gulp.task('compile-tests', () => pipeCompileTests(gulp.src(test)))
gulp.task('watch-compile-tests', () => pipeCompileTests(srcWatch(test)))

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

	//TODO: SHARE CODE
	pipeCompile = stream =>
		stream
		.pipe(sourcemaps.init())
		.pipe(babel(babelOpts))
		.pipe(header(
			'if (typeof define !== \'function\') var define = require(\'amdefine\')(module);'))
		.pipe(sourcemaps.write({ debug: true, sourceRoot: '/src' }))
		.pipe(gulp.dest('dist')),

	pipeCompileTests = stream =>
		stream.pipe(sourcemaps.init())
		.pipe(babel(babelOpts))
		.pipe(header(
			'if (typeof define !== \'function\') var define = require(\'amdefine\')(module);'))
		.pipe(sourcemaps.write({ debug: true, sourceRoot: '/test' }))
		.pipe(gulp.dest('compiled-test')),

	babelOpts = {
		modules: 'amd',
		whitelist: [ 'es6.destructuring', 'es6.modules', 'strict' ]
	}
