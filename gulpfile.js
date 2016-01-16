const gulp = require('gulp')
const ts = require('gulp-typescript-esast')
ts(gulp, 'src', 'lib')
ts(gulp, 'test', 'compiled-test')
