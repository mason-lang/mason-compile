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

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL0NvbXBpbGVPcHRpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BT3FCLGNBQWM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBQWQsY0FBYyIsImZpbGUiOiJDb21waWxlT3B0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWZhdWx0QnVpbHRpbnMgZnJvbSAnLi9kZWZhdWx0QnVpbHRpbnMnXG5pbXBvcnQge2xhc3QsIHR5cGV9IGZyb20gJy4vdXRpbCdcblxuLyoqXG5TdG9yZXMgYG9wdHNgIHBhcmFtZXRlciB0byBjb21waWxlIG1ldGhvZHMgYW5kIHN1cHBsaWVzIGRlZmF1bHRzLlxuU2VlIHtAbGluayBjb21waWxlfSBmb3IgZGVzY3JpcHRpb24gb2Ygb3B0aW9ucy5cbiovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21waWxlT3B0aW9ucyB7XG5cdGNvbnN0cnVjdG9yKG9wdHMpIHtcblx0XHRjb25zdCBkZWZpbmUgPSAobmFtZSwgX2RlZmF1bHQpID0+IHtcblx0XHRcdHRoaXNbYF8ke25hbWV9YF0gPSBvcHRzW25hbWVdID09PSB1bmRlZmluZWQgPyBfZGVmYXVsdCA6IG9wdHNbbmFtZV1cblx0XHR9XG5cblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdGluY2x1ZGVBbWRlZmluZTogZmFsc2UsXG5cdFx0XHRpbmNsdWRlU291cmNlTWFwOiB0cnVlLFxuXHRcdFx0bGF6eU1vZHVsZXM6IGZhbHNlLFxuXHRcdFx0dXNlU3RyaWN0OiB0cnVlLFxuXHRcdFx0Y2hlY2tzOiB0cnVlLFxuXHRcdFx0aW1wb3J0Qm9vdDogdHJ1ZSxcblx0XHRcdG1zbFBhdGg6ICdtc2wnLFxuXHRcdFx0aW5kZW50OiAnXFx0J1xuXHRcdH1cblxuXHRcdGNvbnN0IGFsbE9wdHMgPSBuZXcgU2V0KE9iamVjdC5rZXlzKGRlZmF1bHRzKS5jb25jYXQoWydpbkZpbGUnLCAnYnVpbHRpbnMnXSkpXG5cblx0XHRmb3IgKGNvbnN0IF8gaW4gZGVmYXVsdHMpXG5cdFx0XHRkZWZpbmUoXywgZGVmYXVsdHNbX10pXG5cblx0XHRmb3IgKGNvbnN0IF8gaW4gb3B0cylcblx0XHRcdGlmICghYWxsT3B0cy5oYXMoXykpXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIG9wdGlvbiAke199YClcblxuXHRcdGNvbnN0IGluRmlsZSA9IG9wdHMuaW5GaWxlXG5cdFx0aWYgKGluRmlsZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZiAodGhpcy5faW5jbHVkZVNvdXJjZU1hcClcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFaXRoZXIgc3VwcGx5IGBpbkZpbGVgIG9wdGlvbiBvciBtYWtlIGBpbmNsdWRlU291cmNlTWFwYCBmYWxzZS4nKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0eXBlKGluRmlsZSwgU3RyaW5nKVxuXHRcdFx0dGhpcy5faW5GaWxlID0gaW5GaWxlXG5cdFx0fVxuXG5cdFx0aWYgKCEodGhpcy5faW5kZW50ID09PSAnXFx0JyB8fCAyIDw9IHRoaXMuX2luZGVudCAmJiB0aGlzLl9pbmRlbnQgPD0gOCkpXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYG9wdHMuaW5kZW50IG11c3QgYmUgJ1xcdCcgb3IgYSBudW1iZXIgMi04LCBnb3Q6ICR7dGhpcy5faW5kZW50fWApXG5cblx0XHRjb25zdCBidWlsdGlucyA9IG9wdHMuYnVpbHRpbnMgfHwgZ2V0RGVmYXVsdEJ1aWx0aW5zKHRoaXMuX21zbFBhdGgpXG5cdFx0dGhpcy5idWlsdGluTmFtZVRvUGF0aCA9IGdlbmVyYXRlQnVpbHRpbnNNYXAoYnVpbHRpbnMpXG5cdH1cblxuXHRpbmRlbnQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2luZGVudFxuXHR9XG5cblx0bW9kdWxlTmFtZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5faW5GaWxlID09PSB1bmRlZmluZWQgPyAnYW5vbnltb3VzJyA6IG5vRXh0KGJhc2VuYW1lKHRoaXMuX2luRmlsZSkpXG5cdH1cblxuXHRqc0Jhc2VOYW1lKCkgeyByZXR1cm4gYCR7dGhpcy5tb2R1bGVOYW1lKCl9LmpzYCB9XG5cdG1vZHVsZVBhdGgoKSB7IHJldHVybiB0aGlzLl9pbkZpbGUgfVxuXG5cdGluY2x1ZGVDaGVja3MoKSB7IHJldHVybiB0aGlzLl9jaGVja3MgfVxuXG5cdGluY2x1ZGVBbWRlZmluZSgpIHsgcmV0dXJuIHRoaXMuX2luY2x1ZGVBbWRlZmluZSB9XG5cdGluY2x1ZGVTb3VyY2VNYXAoKSB7IHJldHVybiB0aGlzLl9pbmNsdWRlU291cmNlTWFwIH1cblx0aW5jbHVkZVVzZVN0cmljdCgpIHsgcmV0dXJuIHRoaXMuX3VzZVN0cmljdCB9XG5cblx0bGF6eU1vZHVsZSgpIHsgcmV0dXJuIHRoaXMuX2xhenlNb2R1bGVzIH1cblxuXHRpbXBvcnRCb290KCkgeyByZXR1cm4gdGhpcy5faW1wb3J0Qm9vdCB9XG5cdGJvb3RQYXRoKCkgeyByZXR1cm4gYCR7dGhpcy5fbXNsUGF0aH0vcHJpdmF0ZS9ib290YCB9XG59XG5cbmZ1bmN0aW9uIGJhc2VuYW1lKHBhdGgpIHtcblx0cmV0dXJuIGxhc3QocGF0aC5zcGxpdCgnLycpKVxufVxuXG5mdW5jdGlvbiBleHRuYW1lKHBhdGgpIHtcblx0cmV0dXJuIGxhc3QocGF0aC5zcGxpdCgnLicpKVxufVxuXG5mdW5jdGlvbiBub0V4dChwYXRoKSB7XG5cdC8vIC0gMSBmb3IgdGhlICcuJ1xuXHRyZXR1cm4gcGF0aC5zdWJzdHJpbmcoMCwgcGF0aC5sZW5ndGggLSAxIC0gZXh0bmFtZShwYXRoKS5sZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRCdWlsdGlucyhtc2xQYXRoKSB7XG5cdGNvbnN0IGJ1aWx0aW5zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdEJ1aWx0aW5zKVxuXHRpZiAobXNsUGF0aCAhPT0gJ21zbCcpXG5cdFx0Zm9yIChsZXQga2V5IGluIGJ1aWx0aW5zKSB7XG5cdFx0XHRjb25zdCB4ID0gYnVpbHRpbnNba2V5XVxuXHRcdFx0ZGVsZXRlIGJ1aWx0aW5zW2tleV1cblx0XHRcdGJ1aWx0aW5zW2tleS5yZXBsYWNlKC9tc2wvZywgbXNsUGF0aCldID0geFxuXHRcdH1cblx0cmV0dXJuIGJ1aWx0aW5zXG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlQnVpbHRpbnNNYXAoYnVpbHRpbnMpIHtcblx0Y29uc3QgbSA9IG5ldyBNYXAoKVxuXHRmb3IgKGNvbnN0IHBhdGggaW4gYnVpbHRpbnMpIHtcblx0XHRjb25zdCByZWFsUGF0aCA9IHBhdGgucmVwbGFjZSgvXFwuL2csICcvJylcblx0XHRmb3IgKGxldCBpbXBvcnRlZCBvZiBidWlsdGluc1twYXRoXSkge1xuXHRcdFx0aWYgKGltcG9ydGVkID09PSAnXycpXG5cdFx0XHRcdGltcG9ydGVkID0gbGFzdChwYXRoLnNwbGl0KCcuJykpXG5cdFx0XHRpZiAobS5oYXMoaW1wb3J0ZWQpKVxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEJ1aWx0aW4gJHtpbXBvcnRlZH0gZGVmaW5lZCBtb3JlIHRoYW4gb25jZS5gKVxuXHRcdFx0bS5zZXQoaW1wb3J0ZWQsIHJlYWxQYXRoKVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbVxufVxuIl19