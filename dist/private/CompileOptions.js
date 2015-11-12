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

			if (!(this._indent === '\t' || 2 <= this._indent && this._indent <= 8)) throw new Error(`opts.indent must be '\t' or a number 2-8, got: ${ this._indent }`);
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
		if (mslPath !== 'msl') for (let key in builtins) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL0NvbXBpbGVPcHRpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQU9xQixjQUFjOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQUFkLGNBQWMiLCJmaWxlIjoiQ29tcGlsZU9wdGlvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZGVmYXVsdEJ1aWx0aW5zIGZyb20gJy4vZGVmYXVsdEJ1aWx0aW5zJ1xuaW1wb3J0IHtsYXN0LCB0eXBlfSBmcm9tICcuL3V0aWwnXG5cbi8qKlxuU3RvcmVzIGBvcHRzYCBwYXJhbWV0ZXIgdG8gY29tcGlsZSBtZXRob2RzIGFuZCBzdXBwbGllcyBkZWZhdWx0cy5cblNlZSB7QGxpbmsgY29tcGlsZX0gZm9yIGRlc2NyaXB0aW9uIG9mIG9wdGlvbnMuXG4qL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tcGlsZU9wdGlvbnMge1xuXHRjb25zdHJ1Y3RvcihvcHRzKSB7XG5cdFx0Y29uc3QgZGVmaW5lID0gKG5hbWUsIF9kZWZhdWx0KSA9PiB7XG5cdFx0XHR0aGlzW2BfJHtuYW1lfWBdID0gb3B0c1tuYW1lXSA9PT0gdW5kZWZpbmVkID8gX2RlZmF1bHQgOiBvcHRzW25hbWVdXG5cdFx0fVxuXG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRpbmNsdWRlQW1kZWZpbmU6IGZhbHNlLFxuXHRcdFx0aW5jbHVkZVNvdXJjZU1hcDogdHJ1ZSxcblx0XHRcdGxhenlNb2R1bGVzOiBmYWxzZSxcblx0XHRcdHVzZVN0cmljdDogdHJ1ZSxcblx0XHRcdGNoZWNrczogdHJ1ZSxcblx0XHRcdGltcG9ydEJvb3Q6IHRydWUsXG5cdFx0XHRtc2xQYXRoOiAnbXNsJyxcblx0XHRcdGluZGVudDogJ1xcdCdcblx0XHR9XG5cblx0XHRjb25zdCBhbGxPcHRzID0gbmV3IFNldChPYmplY3Qua2V5cyhkZWZhdWx0cykuY29uY2F0KFsnaW5GaWxlJywgJ2J1aWx0aW5zJ10pKVxuXG5cdFx0Zm9yIChjb25zdCBfIGluIGRlZmF1bHRzKVxuXHRcdFx0ZGVmaW5lKF8sIGRlZmF1bHRzW19dKVxuXG5cdFx0Zm9yIChjb25zdCBfIGluIG9wdHMpXG5cdFx0XHRpZiAoIWFsbE9wdHMuaGFzKF8pKVxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYFVucmVjb2duaXplZCBvcHRpb24gJHtffWApXG5cblx0XHRjb25zdCBpbkZpbGUgPSBvcHRzLmluRmlsZVxuXHRcdGlmIChpbkZpbGUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYgKHRoaXMuX2luY2x1ZGVTb3VyY2VNYXApXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignRWl0aGVyIHN1cHBseSBgaW5GaWxlYCBvcHRpb24gb3IgbWFrZSBgaW5jbHVkZVNvdXJjZU1hcGAgZmFsc2UuJylcblx0XHR9IGVsc2Uge1xuXHRcdFx0dHlwZShpbkZpbGUsIFN0cmluZylcblx0XHRcdHRoaXMuX2luRmlsZSA9IGluRmlsZVxuXHRcdH1cblxuXHRcdGlmICghKHRoaXMuX2luZGVudCA9PT0gJ1xcdCcgfHwgMiA8PSB0aGlzLl9pbmRlbnQgJiYgdGhpcy5faW5kZW50IDw9IDgpKVxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBvcHRzLmluZGVudCBtdXN0IGJlICdcXHQnIG9yIGEgbnVtYmVyIDItOCwgZ290OiAke3RoaXMuX2luZGVudH1gKVxuXG5cdFx0Y29uc3QgYnVpbHRpbnMgPSBvcHRzLmJ1aWx0aW5zIHx8IGdldERlZmF1bHRCdWlsdGlucyh0aGlzLl9tc2xQYXRoKVxuXHRcdHRoaXMuYnVpbHRpbk5hbWVUb1BhdGggPSBnZW5lcmF0ZUJ1aWx0aW5zTWFwKGJ1aWx0aW5zKVxuXHR9XG5cblx0aW5kZW50KCkge1xuXHRcdHJldHVybiB0aGlzLl9pbmRlbnRcblx0fVxuXG5cdG1vZHVsZU5hbWUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2luRmlsZSA9PT0gdW5kZWZpbmVkID8gJ2Fub255bW91cycgOiBub0V4dChiYXNlbmFtZSh0aGlzLl9pbkZpbGUpKVxuXHR9XG5cblx0anNCYXNlTmFtZSgpIHsgcmV0dXJuIGAke3RoaXMubW9kdWxlTmFtZSgpfS5qc2AgfVxuXHRtb2R1bGVQYXRoKCkgeyByZXR1cm4gdGhpcy5faW5GaWxlIH1cblxuXHRpbmNsdWRlQ2hlY2tzKCkgeyByZXR1cm4gdGhpcy5fY2hlY2tzIH1cblxuXHRpbmNsdWRlQW1kZWZpbmUoKSB7IHJldHVybiB0aGlzLl9pbmNsdWRlQW1kZWZpbmUgfVxuXHRpbmNsdWRlU291cmNlTWFwKCkgeyByZXR1cm4gdGhpcy5faW5jbHVkZVNvdXJjZU1hcCB9XG5cdGluY2x1ZGVVc2VTdHJpY3QoKSB7IHJldHVybiB0aGlzLl91c2VTdHJpY3QgfVxuXG5cdGxhenlNb2R1bGUoKSB7IHJldHVybiB0aGlzLl9sYXp5TW9kdWxlcyB9XG5cblx0aW1wb3J0Qm9vdCgpIHsgcmV0dXJuIHRoaXMuX2ltcG9ydEJvb3QgfVxuXHRib290UGF0aCgpIHsgcmV0dXJuIGAke3RoaXMuX21zbFBhdGh9L3ByaXZhdGUvYm9vdGAgfVxufVxuXG5mdW5jdGlvbiBiYXNlbmFtZShwYXRoKSB7XG5cdHJldHVybiBsYXN0KHBhdGguc3BsaXQoJy8nKSlcbn1cblxuZnVuY3Rpb24gZXh0bmFtZShwYXRoKSB7XG5cdHJldHVybiBsYXN0KHBhdGguc3BsaXQoJy4nKSlcbn1cblxuZnVuY3Rpb24gbm9FeHQocGF0aCkge1xuXHQvLyAtIDEgZm9yIHRoZSAnLidcblx0cmV0dXJuIHBhdGguc3Vic3RyaW5nKDAsIHBhdGgubGVuZ3RoIC0gMSAtIGV4dG5hbWUocGF0aCkubGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QnVpbHRpbnMobXNsUGF0aCkge1xuXHRjb25zdCBidWlsdGlucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRCdWlsdGlucylcblx0aWYgKG1zbFBhdGggIT09ICdtc2wnKVxuXHRcdGZvciAobGV0IGtleSBpbiBidWlsdGlucykge1xuXHRcdFx0Y29uc3QgeCA9IGJ1aWx0aW5zW2tleV1cblx0XHRcdGRlbGV0ZSBidWlsdGluc1trZXldXG5cdFx0XHRidWlsdGluc1trZXkucmVwbGFjZSgvbXNsL2csIG1zbFBhdGgpXSA9IHhcblx0XHR9XG5cdHJldHVybiBidWlsdGluc1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUJ1aWx0aW5zTWFwKGJ1aWx0aW5zKSB7XG5cdGNvbnN0IG0gPSBuZXcgTWFwKClcblx0Zm9yIChjb25zdCBwYXRoIGluIGJ1aWx0aW5zKSB7XG5cdFx0Y29uc3QgcmVhbFBhdGggPSBwYXRoLnJlcGxhY2UoL1xcLi9nLCAnLycpXG5cdFx0Zm9yIChsZXQgaW1wb3J0ZWQgb2YgYnVpbHRpbnNbcGF0aF0pIHtcblx0XHRcdGlmIChpbXBvcnRlZCA9PT0gJ18nKVxuXHRcdFx0XHRpbXBvcnRlZCA9IGxhc3QocGF0aC5zcGxpdCgnLicpKVxuXHRcdFx0aWYgKG0uaGFzKGltcG9ydGVkKSlcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBCdWlsdGluICR7aW1wb3J0ZWR9IGRlZmluZWQgbW9yZSB0aGFuIG9uY2UuYClcblx0XHRcdG0uc2V0KGltcG9ydGVkLCByZWFsUGF0aClcblx0XHR9XG5cdH1cblx0cmV0dXJuIG1cbn1cbiJdfQ==