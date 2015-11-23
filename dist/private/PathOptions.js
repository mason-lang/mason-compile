'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.util);
		global.PathOptions = mod.exports;
	}
})(this, function (exports, _util) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	class PathOptions {
		constructor(filename) {
			this.filename = filename;
		}

		modulePath() {
			return this.filename;
		}

		moduleName() {
			return noExt(basename(this.filename));
		}

		jsBaseName() {
			return `${ this.moduleName() }.js`;
		}

	}

	exports.default = PathOptions;

	function basename(path) {
		return (0, _util.last)(path.split('/'));
	}

	function extname(path) {
		return (0, _util.last)(path.split('.'));
	}

	function noExt(path) {
		return path.substring(0, path.length - 1 - extname(path).length);
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL1BhdGhPcHRpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FFcUIsV0FBVzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQkFBWCxXQUFXIiwiZmlsZSI6IlBhdGhPcHRpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtsYXN0fSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhdGhPcHRpb25zIHtcblx0Y29uc3RydWN0b3IoZmlsZW5hbWUpIHtcblx0XHR0aGlzLmZpbGVuYW1lID0gZmlsZW5hbWVcblx0fVxuXG5cdG1vZHVsZVBhdGgoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZmlsZW5hbWVcblx0fVxuXG5cdG1vZHVsZU5hbWUoKSB7XG5cdFx0cmV0dXJuIG5vRXh0KGJhc2VuYW1lKHRoaXMuZmlsZW5hbWUpKVxuXHR9XG5cblx0anNCYXNlTmFtZSgpIHtcblx0XHRyZXR1cm4gYCR7dGhpcy5tb2R1bGVOYW1lKCl9LmpzYFxuXHR9XG59XG5cbmZ1bmN0aW9uIGJhc2VuYW1lKHBhdGgpIHtcblx0cmV0dXJuIGxhc3QocGF0aC5zcGxpdCgnLycpKVxufVxuXG5mdW5jdGlvbiBleHRuYW1lKHBhdGgpIHtcblx0cmV0dXJuIGxhc3QocGF0aC5zcGxpdCgnLicpKVxufVxuXG5mdW5jdGlvbiBub0V4dChwYXRoKSB7XG5cdC8vIC0gMSBmb3IgdGhlICcuJ1xuXHRyZXR1cm4gcGF0aC5zdWJzdHJpbmcoMCwgcGF0aC5sZW5ndGggLSAxIC0gZXh0bmFtZShwYXRoKS5sZW5ndGgpXG59XG4iXX0=