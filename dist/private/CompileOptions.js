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
			const allOpts = new Set((0, _util.cat)(Object.keys(defaults), 'builtins'));

			for (const _ in defaults) define(_, defaults[_]);

			for (const _ in opts) if (!allOpts.has(_)) throw new Error(`Unrecognized option ${ _ }`);

			const minIndent = 2,
			      maxIndent = 8;
			if (!(this._indent === '\t' || minIndent <= this._indent && this._indent <= maxIndent)) throw new Error(`opts.indent must be '\t' or a number 2-8, got: ${ this._indent }`);
			const builtins = opts.builtins || getDefaultBuiltins(this._mslPath);
			this.builtinNameToPath = generateBuiltinsMap(builtins);
		}

		indent() {
			return this._indent;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL0NvbXBpbGVPcHRpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQU9xQixjQUFjOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBQWQsY0FBYyIsImZpbGUiOiJDb21waWxlT3B0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWZhdWx0QnVpbHRpbnMgZnJvbSAnLi9kZWZhdWx0QnVpbHRpbnMnXG5pbXBvcnQge2NhdCwgbGFzdH0gZnJvbSAnLi91dGlsJ1xuXG4vKipcblN0b3JlcyBgb3B0c2AgcGFyYW1ldGVyIHRvIGNvbXBpbGUgbWV0aG9kcyBhbmQgc3VwcGxpZXMgZGVmYXVsdHMuXG5TZWUge0BsaW5rIGNvbXBpbGV9IGZvciBkZXNjcmlwdGlvbiBvZiBvcHRpb25zLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbXBpbGVPcHRpb25zIHtcblx0Y29uc3RydWN0b3Iob3B0cykge1xuXHRcdGNvbnN0IGRlZmluZSA9IChuYW1lLCBfZGVmYXVsdCkgPT4ge1xuXHRcdFx0dGhpc1tgXyR7bmFtZX1gXSA9IG9wdHNbbmFtZV0gPT09IHVuZGVmaW5lZCA/IF9kZWZhdWx0IDogb3B0c1tuYW1lXVxuXHRcdH1cblxuXHRcdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdFx0aW5jbHVkZUFtZGVmaW5lOiBmYWxzZSxcblx0XHRcdGluY2x1ZGVTb3VyY2VNYXA6IHRydWUsXG5cdFx0XHRsYXp5TW9kdWxlczogZmFsc2UsXG5cdFx0XHR1c2VTdHJpY3Q6IHRydWUsXG5cdFx0XHRjaGVja3M6IHRydWUsXG5cdFx0XHRpbXBvcnRCb290OiB0cnVlLFxuXHRcdFx0bXNsUGF0aDogJ21zbCcsXG5cdFx0XHRpbmRlbnQ6ICdcXHQnXG5cdFx0fVxuXG5cdFx0Y29uc3QgYWxsT3B0cyA9IG5ldyBTZXQoY2F0KE9iamVjdC5rZXlzKGRlZmF1bHRzKSwgJ2J1aWx0aW5zJykpXG5cblx0XHRmb3IgKGNvbnN0IF8gaW4gZGVmYXVsdHMpXG5cdFx0XHRkZWZpbmUoXywgZGVmYXVsdHNbX10pXG5cblx0XHRmb3IgKGNvbnN0IF8gaW4gb3B0cylcblx0XHRcdGlmICghYWxsT3B0cy5oYXMoXykpXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIG9wdGlvbiAke199YClcblxuXHRcdGNvbnN0IG1pbkluZGVudCA9IDIsIG1heEluZGVudCA9IDhcblx0XHRpZiAoISh0aGlzLl9pbmRlbnQgPT09ICdcXHQnIHx8IG1pbkluZGVudCA8PSB0aGlzLl9pbmRlbnQgJiYgdGhpcy5faW5kZW50IDw9IG1heEluZGVudCkpXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYG9wdHMuaW5kZW50IG11c3QgYmUgJ1xcdCcgb3IgYSBudW1iZXIgMi04LCBnb3Q6ICR7dGhpcy5faW5kZW50fWApXG5cblx0XHRjb25zdCBidWlsdGlucyA9IG9wdHMuYnVpbHRpbnMgfHwgZ2V0RGVmYXVsdEJ1aWx0aW5zKHRoaXMuX21zbFBhdGgpXG5cdFx0dGhpcy5idWlsdGluTmFtZVRvUGF0aCA9IGdlbmVyYXRlQnVpbHRpbnNNYXAoYnVpbHRpbnMpXG5cdH1cblxuXHRpbmRlbnQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2luZGVudFxuXHR9XG5cblx0aW5jbHVkZUNoZWNrcygpIHtcblx0XHRyZXR1cm4gdGhpcy5fY2hlY2tzXG5cdH1cblxuXHRpbmNsdWRlQW1kZWZpbmUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2luY2x1ZGVBbWRlZmluZVxuXHR9XG5cdGluY2x1ZGVTb3VyY2VNYXAoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2luY2x1ZGVTb3VyY2VNYXBcblx0fVxuXHRpbmNsdWRlVXNlU3RyaWN0KCkge1xuXHRcdHJldHVybiB0aGlzLl91c2VTdHJpY3Rcblx0fVxuXG5cdGxhenlNb2R1bGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2xhenlNb2R1bGVzXG5cdH1cblxuXHRpbXBvcnRCb290KCkge1xuXHRcdHJldHVybiB0aGlzLl9pbXBvcnRCb290XG5cdH1cblx0Ym9vdFBhdGgoKSB7XG5cdFx0cmV0dXJuIGAke3RoaXMuX21zbFBhdGh9L3ByaXZhdGUvYm9vdGBcblx0fVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QnVpbHRpbnMobXNsUGF0aCkge1xuXHRjb25zdCBidWlsdGlucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRCdWlsdGlucylcblx0aWYgKG1zbFBhdGggIT09ICdtc2wnKVxuXHRcdGZvciAoY29uc3Qga2V5IGluIGJ1aWx0aW5zKSB7XG5cdFx0XHRjb25zdCB4ID0gYnVpbHRpbnNba2V5XVxuXHRcdFx0ZGVsZXRlIGJ1aWx0aW5zW2tleV1cblx0XHRcdGJ1aWx0aW5zW2tleS5yZXBsYWNlKC9tc2wvZywgbXNsUGF0aCldID0geFxuXHRcdH1cblx0cmV0dXJuIGJ1aWx0aW5zXG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlQnVpbHRpbnNNYXAoYnVpbHRpbnMpIHtcblx0Y29uc3QgbSA9IG5ldyBNYXAoKVxuXHRmb3IgKGNvbnN0IHBhdGggaW4gYnVpbHRpbnMpIHtcblx0XHRjb25zdCByZWFsUGF0aCA9IHBhdGgucmVwbGFjZSgvXFwuL2csICcvJylcblx0XHRmb3IgKGxldCBpbXBvcnRlZCBvZiBidWlsdGluc1twYXRoXSkge1xuXHRcdFx0aWYgKGltcG9ydGVkID09PSAnXycpXG5cdFx0XHRcdGltcG9ydGVkID0gbGFzdChwYXRoLnNwbGl0KCcuJykpXG5cdFx0XHRpZiAobS5oYXMoaW1wb3J0ZWQpKVxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEJ1aWx0aW4gJHtpbXBvcnRlZH0gZGVmaW5lZCBtb3JlIHRoYW4gb25jZS5gKVxuXHRcdFx0bS5zZXQoaW1wb3J0ZWQsIHJlYWxQYXRoKVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbVxufVxuIl19