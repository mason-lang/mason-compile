'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './defaultBuiltins', './util'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./defaultBuiltins'), require('./util'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.defaultBuiltins, global.util);
		global.CompileOptions = mod.exports;
	}
})(this, function (exports, _defaultBuiltins, _util) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _defaultBuiltins2 = _interopRequireDefault(_defaultBuiltins);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	class CompileOptions {
		constructor(opts) {
			const define = (name, _default) => {
				this[`_${ name }`] = opts[name] === undefined ? _default : opts[name];
			};

			const defaults = {
				includeAmdefine: false,
				includeSourceMap: true,
				lazyModules: false,
				useStrict: true,
				checks: true,
				importBoot: true,
				mslPath: 'msl',
				indent: '\t'
			};
			const allOpts = new Set(Object.keys(defaults).concat(['inFile', 'builtins']));

			for (const _ in defaults) define(_, defaults[_]);

			for (const _ in opts) if (!allOpts.has(_)) throw new Error(`Unrecognized option ${ _ }`);

			const inFile = opts.inFile;

			if (inFile === undefined) {
				if (this._includeSourceMap) throw new Error('Either supply `inFile` option or make `includeSourceMap` false.');
			} else {
				(0, _util.type)(inFile, String);
				this._inFile = inFile;
			}

			const minIndent = 2,
			      maxIndent = 8;
			if (!(this._indent === '\t' || minIndent <= this._indent && this._indent <= maxIndent)) throw new Error(`opts.indent must be '\t' or a number 2-8, got: ${ this._indent }`);
			const builtins = opts.builtins || getDefaultBuiltins(this._mslPath);
			this.builtinNameToPath = generateBuiltinsMap(builtins);
		}

		indent() {
			return this._indent;
		}

		moduleName() {
			return this._inFile === undefined ? 'anonymous' : noExt(basename(this._inFile));
		}

		jsBaseName() {
			return `${ this.moduleName() }.js`;
		}

		modulePath() {
			return this._inFile;
		}

		includeChecks() {
			return this._checks;
		}

		includeAmdefine() {
			return this._includeAmdefine;
		}

		includeSourceMap() {
			return this._includeSourceMap;
		}

		includeUseStrict() {
			return this._useStrict;
		}

		lazyModule() {
			return this._lazyModules;
		}

		importBoot() {
			return this._importBoot;
		}

		bootPath() {
			return `${ this._mslPath }/private/boot`;
		}

	}

	exports.default = CompileOptions;

	function basename(path) {
		return (0, _util.last)(path.split('/'));
	}

	function extname(path) {
		return (0, _util.last)(path.split('.'));
	}

	function noExt(path) {
		return path.substring(0, path.length - 1 - extname(path).length);
	}

	function getDefaultBuiltins(mslPath) {
		const builtins = Object.assign({}, _defaultBuiltins2.default);
		if (mslPath !== 'msl') for (const key in builtins) {
			const x = builtins[key];
			delete builtins[key];
			builtins[key.replace(/msl/g, mslPath)] = x;
		}
		return builtins;
	}

	function generateBuiltinsMap(builtins) {
		const m = new Map();

		for (const path in builtins) {
			const realPath = path.replace(/\./g, '/');

			for (let imported of builtins[path]) {
				if (imported === '_') imported = (0, _util.last)(path.split('.'));
				if (m.has(imported)) throw new Error(`Builtin ${ imported } defined more than once.`);
				m.set(imported, realPath);
			}
		}

		return m;
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL0NvbXBpbGVPcHRpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQU9xQixjQUFjOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBQWQsY0FBYyIsImZpbGUiOiJDb21waWxlT3B0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWZhdWx0QnVpbHRpbnMgZnJvbSAnLi9kZWZhdWx0QnVpbHRpbnMnXG5pbXBvcnQge2xhc3QsIHR5cGV9IGZyb20gJy4vdXRpbCdcblxuLyoqXG5TdG9yZXMgYG9wdHNgIHBhcmFtZXRlciB0byBjb21waWxlIG1ldGhvZHMgYW5kIHN1cHBsaWVzIGRlZmF1bHRzLlxuU2VlIHtAbGluayBjb21waWxlfSBmb3IgZGVzY3JpcHRpb24gb2Ygb3B0aW9ucy5cbiovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21waWxlT3B0aW9ucyB7XG5cdGNvbnN0cnVjdG9yKG9wdHMpIHtcblx0XHRjb25zdCBkZWZpbmUgPSAobmFtZSwgX2RlZmF1bHQpID0+IHtcblx0XHRcdHRoaXNbYF8ke25hbWV9YF0gPSBvcHRzW25hbWVdID09PSB1bmRlZmluZWQgPyBfZGVmYXVsdCA6IG9wdHNbbmFtZV1cblx0XHR9XG5cblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdGluY2x1ZGVBbWRlZmluZTogZmFsc2UsXG5cdFx0XHRpbmNsdWRlU291cmNlTWFwOiB0cnVlLFxuXHRcdFx0bGF6eU1vZHVsZXM6IGZhbHNlLFxuXHRcdFx0dXNlU3RyaWN0OiB0cnVlLFxuXHRcdFx0Y2hlY2tzOiB0cnVlLFxuXHRcdFx0aW1wb3J0Qm9vdDogdHJ1ZSxcblx0XHRcdG1zbFBhdGg6ICdtc2wnLFxuXHRcdFx0aW5kZW50OiAnXFx0J1xuXHRcdH1cblxuXHRcdGNvbnN0IGFsbE9wdHMgPSBuZXcgU2V0KE9iamVjdC5rZXlzKGRlZmF1bHRzKS5jb25jYXQoWydpbkZpbGUnLCAnYnVpbHRpbnMnXSkpXG5cblx0XHRmb3IgKGNvbnN0IF8gaW4gZGVmYXVsdHMpXG5cdFx0XHRkZWZpbmUoXywgZGVmYXVsdHNbX10pXG5cblx0XHRmb3IgKGNvbnN0IF8gaW4gb3B0cylcblx0XHRcdGlmICghYWxsT3B0cy5oYXMoXykpXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIG9wdGlvbiAke199YClcblxuXHRcdGNvbnN0IGluRmlsZSA9IG9wdHMuaW5GaWxlXG5cdFx0aWYgKGluRmlsZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZiAodGhpcy5faW5jbHVkZVNvdXJjZU1hcClcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFaXRoZXIgc3VwcGx5IGBpbkZpbGVgIG9wdGlvbiBvciBtYWtlIGBpbmNsdWRlU291cmNlTWFwYCBmYWxzZS4nKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0eXBlKGluRmlsZSwgU3RyaW5nKVxuXHRcdFx0dGhpcy5faW5GaWxlID0gaW5GaWxlXG5cdFx0fVxuXG5cdFx0Y29uc3QgbWluSW5kZW50ID0gMiwgbWF4SW5kZW50ID0gOFxuXHRcdGlmICghKHRoaXMuX2luZGVudCA9PT0gJ1xcdCcgfHwgbWluSW5kZW50IDw9IHRoaXMuX2luZGVudCAmJiB0aGlzLl9pbmRlbnQgPD0gbWF4SW5kZW50KSlcblx0XHRcdHRocm93IG5ldyBFcnJvcihgb3B0cy5pbmRlbnQgbXVzdCBiZSAnXFx0JyBvciBhIG51bWJlciAyLTgsIGdvdDogJHt0aGlzLl9pbmRlbnR9YClcblxuXHRcdGNvbnN0IGJ1aWx0aW5zID0gb3B0cy5idWlsdGlucyB8fCBnZXREZWZhdWx0QnVpbHRpbnModGhpcy5fbXNsUGF0aClcblx0XHR0aGlzLmJ1aWx0aW5OYW1lVG9QYXRoID0gZ2VuZXJhdGVCdWlsdGluc01hcChidWlsdGlucylcblx0fVxuXG5cdGluZGVudCgpIHtcblx0XHRyZXR1cm4gdGhpcy5faW5kZW50XG5cdH1cblxuXHRtb2R1bGVOYW1lKCkge1xuXHRcdHJldHVybiB0aGlzLl9pbkZpbGUgPT09IHVuZGVmaW5lZCA/ICdhbm9ueW1vdXMnIDogbm9FeHQoYmFzZW5hbWUodGhpcy5faW5GaWxlKSlcblx0fVxuXG5cdGpzQmFzZU5hbWUoKSB7IHJldHVybiBgJHt0aGlzLm1vZHVsZU5hbWUoKX0uanNgIH1cblx0bW9kdWxlUGF0aCgpIHsgcmV0dXJuIHRoaXMuX2luRmlsZSB9XG5cblx0aW5jbHVkZUNoZWNrcygpIHsgcmV0dXJuIHRoaXMuX2NoZWNrcyB9XG5cblx0aW5jbHVkZUFtZGVmaW5lKCkgeyByZXR1cm4gdGhpcy5faW5jbHVkZUFtZGVmaW5lIH1cblx0aW5jbHVkZVNvdXJjZU1hcCgpIHsgcmV0dXJuIHRoaXMuX2luY2x1ZGVTb3VyY2VNYXAgfVxuXHRpbmNsdWRlVXNlU3RyaWN0KCkgeyByZXR1cm4gdGhpcy5fdXNlU3RyaWN0IH1cblxuXHRsYXp5TW9kdWxlKCkgeyByZXR1cm4gdGhpcy5fbGF6eU1vZHVsZXMgfVxuXG5cdGltcG9ydEJvb3QoKSB7IHJldHVybiB0aGlzLl9pbXBvcnRCb290IH1cblx0Ym9vdFBhdGgoKSB7IHJldHVybiBgJHt0aGlzLl9tc2xQYXRofS9wcml2YXRlL2Jvb3RgIH1cbn1cblxuZnVuY3Rpb24gYmFzZW5hbWUocGF0aCkge1xuXHRyZXR1cm4gbGFzdChwYXRoLnNwbGl0KCcvJykpXG59XG5cbmZ1bmN0aW9uIGV4dG5hbWUocGF0aCkge1xuXHRyZXR1cm4gbGFzdChwYXRoLnNwbGl0KCcuJykpXG59XG5cbmZ1bmN0aW9uIG5vRXh0KHBhdGgpIHtcblx0Ly8gLSAxIGZvciB0aGUgJy4nXG5cdHJldHVybiBwYXRoLnN1YnN0cmluZygwLCBwYXRoLmxlbmd0aCAtIDEgLSBleHRuYW1lKHBhdGgpLmxlbmd0aClcbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEJ1aWx0aW5zKG1zbFBhdGgpIHtcblx0Y29uc3QgYnVpbHRpbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0QnVpbHRpbnMpXG5cdGlmIChtc2xQYXRoICE9PSAnbXNsJylcblx0XHRmb3IgKGNvbnN0IGtleSBpbiBidWlsdGlucykge1xuXHRcdFx0Y29uc3QgeCA9IGJ1aWx0aW5zW2tleV1cblx0XHRcdGRlbGV0ZSBidWlsdGluc1trZXldXG5cdFx0XHRidWlsdGluc1trZXkucmVwbGFjZSgvbXNsL2csIG1zbFBhdGgpXSA9IHhcblx0XHR9XG5cdHJldHVybiBidWlsdGluc1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUJ1aWx0aW5zTWFwKGJ1aWx0aW5zKSB7XG5cdGNvbnN0IG0gPSBuZXcgTWFwKClcblx0Zm9yIChjb25zdCBwYXRoIGluIGJ1aWx0aW5zKSB7XG5cdFx0Y29uc3QgcmVhbFBhdGggPSBwYXRoLnJlcGxhY2UoL1xcLi9nLCAnLycpXG5cdFx0Zm9yIChsZXQgaW1wb3J0ZWQgb2YgYnVpbHRpbnNbcGF0aF0pIHtcblx0XHRcdGlmIChpbXBvcnRlZCA9PT0gJ18nKVxuXHRcdFx0XHRpbXBvcnRlZCA9IGxhc3QocGF0aC5zcGxpdCgnLicpKVxuXHRcdFx0aWYgKG0uaGFzKGltcG9ydGVkKSlcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBCdWlsdGluICR7aW1wb3J0ZWR9IGRlZmluZWQgbW9yZSB0aGFuIG9uY2UuYClcblx0XHRcdG0uc2V0KGltcG9ydGVkLCByZWFsUGF0aClcblx0XHR9XG5cdH1cblx0cmV0dXJuIG1cbn1cbiJdfQ==