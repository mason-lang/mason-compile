'use strict'
const babel = require('gulp-babel')
const gulp = require('gulp')
const merge = require('merge2')
const sourcemaps = require('gulp-sourcemaps')
const ts = require('gulp-typescript')

function makeTasks(name, dest, typings) {
	const glob = `${name}/**/*.ts`
	const build = `build-${name}`
	const tsProject = ts.createProject(typescriptOpts)

	gulp.task(build, () => {
		const tsResult = gulp.src(glob)
			.pipe(sourcemaps.init())
			.pipe(ts(tsProject))
		const js = tsResult.js
			.pipe(babel(babelOpts))
			.pipe(sourcemaps.write('.'))
			.pipe(gulp.dest(dest))
		return typings ? merge([js, tsResult.dts.pipe(gulp.dest(dest))]) : js
	})

	gulp.task(`watch-${name}`, [build], () =>
		gulp.watch(glob, [build]))
}

const babelOpts = {
	plugins: [
		require('babel-plugin-transform-es2015-destructuring'),
		require('babel-plugin-transform-es2015-parameters')
	]
}

const typescriptOpts = {
	typescript: require('typescript'),

	declaration: true,
	removeComments: true,

	module: 'umd',
	moduleResolution: 'node',
	target: 'ES6',

	noImplicitAny: true
}

makeTasks('src', 'dist', true)
makeTasks('test', 'compiled-test')
