'use strict';

(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(['exports', './defaultBuiltins', './util', './languages/allLanguages'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require('./defaultBuiltins'), require('./util'), require('./languages/allLanguages'));
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, global.defaultBuiltins, global.util, global.allLanguages);
		global.CompileOptions = mod.exports;
	}
})(this, function (exports, _defaultBuiltins, _util, _allLanguages) {
	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _defaultBuiltins2 = _interopRequireDefault(_defaultBuiltins);

	var _allLanguages2 = _interopRequireDefault(_allLanguages);

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
				indent: '\t',
				language: 'english'
			};
			const allOpts = new Set((0, _util.cat)(Object.keys(defaults), 'builtins'));

			for (const _ in defaults) define(_, defaults[_]);

			for (const _ in opts) if (!allOpts.has(_)) throw new Error(`Unrecognized option: ${ _ }`);

			const minIndent = 2,
			      maxIndent = 8;
			if (!(this._indent === '\t' || minIndent <= this._indent && this._indent <= maxIndent)) throw new Error(`opts.indent must be '\t' or a number 2-8, got: ${ this._indent }`);
			const builtins = opts.builtins || getDefaultBuiltins(this._mslPath);
			this.builtinNameToPath = generateBuiltinsMap(builtins);
			this._language = _allLanguages2.default[this._language];
			if (this._language === undefined) throw new Error(`Bad language: ${ this._language }`);
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

		language() {
			return this._language;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcml2YXRlL0NvbXBpbGVPcHRpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BUXFCLGNBQWM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUJBQWQsY0FBYyIsImZpbGUiOiJDb21waWxlT3B0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWZhdWx0QnVpbHRpbnMgZnJvbSAnLi9kZWZhdWx0QnVpbHRpbnMnXG5pbXBvcnQge2NhdCwgbGFzdH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IGFsbExhbmd1YWdlcyBmcm9tICcuL2xhbmd1YWdlcy9hbGxMYW5ndWFnZXMnXG5cbi8qKlxuU3RvcmVzIGBvcHRzYCBwYXJhbWV0ZXIgdG8gY29tcGlsZSBtZXRob2RzIGFuZCBzdXBwbGllcyBkZWZhdWx0cy5cblNlZSB7QGxpbmsgY29tcGlsZX0gZm9yIGRlc2NyaXB0aW9uIG9mIG9wdGlvbnMuXG4qL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tcGlsZU9wdGlvbnMge1xuXHRjb25zdHJ1Y3RvcihvcHRzKSB7XG5cdFx0Y29uc3QgZGVmaW5lID0gKG5hbWUsIF9kZWZhdWx0KSA9PiB7XG5cdFx0XHR0aGlzW2BfJHtuYW1lfWBdID0gb3B0c1tuYW1lXSA9PT0gdW5kZWZpbmVkID8gX2RlZmF1bHQgOiBvcHRzW25hbWVdXG5cdFx0fVxuXG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRpbmNsdWRlQW1kZWZpbmU6IGZhbHNlLFxuXHRcdFx0aW5jbHVkZVNvdXJjZU1hcDogdHJ1ZSxcblx0XHRcdGxhenlNb2R1bGVzOiBmYWxzZSxcblx0XHRcdHVzZVN0cmljdDogdHJ1ZSxcblx0XHRcdGNoZWNrczogdHJ1ZSxcblx0XHRcdGltcG9ydEJvb3Q6IHRydWUsXG5cdFx0XHRtc2xQYXRoOiAnbXNsJyxcblx0XHRcdGluZGVudDogJ1xcdCcsXG5cdFx0XHRsYW5ndWFnZTogJ2VuZ2xpc2gnXG5cdFx0fVxuXG5cdFx0Y29uc3QgYWxsT3B0cyA9IG5ldyBTZXQoY2F0KE9iamVjdC5rZXlzKGRlZmF1bHRzKSwgJ2J1aWx0aW5zJykpXG5cblx0XHRmb3IgKGNvbnN0IF8gaW4gZGVmYXVsdHMpXG5cdFx0XHRkZWZpbmUoXywgZGVmYXVsdHNbX10pXG5cblx0XHRmb3IgKGNvbnN0IF8gaW4gb3B0cylcblx0XHRcdGlmICghYWxsT3B0cy5oYXMoXykpXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIG9wdGlvbjogJHtffWApXG5cblx0XHRjb25zdCBtaW5JbmRlbnQgPSAyLCBtYXhJbmRlbnQgPSA4XG5cdFx0aWYgKCEodGhpcy5faW5kZW50ID09PSAnXFx0JyB8fCBtaW5JbmRlbnQgPD0gdGhpcy5faW5kZW50ICYmIHRoaXMuX2luZGVudCA8PSBtYXhJbmRlbnQpKVxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBvcHRzLmluZGVudCBtdXN0IGJlICdcXHQnIG9yIGEgbnVtYmVyIDItOCwgZ290OiAke3RoaXMuX2luZGVudH1gKVxuXG5cdFx0Y29uc3QgYnVpbHRpbnMgPSBvcHRzLmJ1aWx0aW5zIHx8IGdldERlZmF1bHRCdWlsdGlucyh0aGlzLl9tc2xQYXRoKVxuXHRcdHRoaXMuYnVpbHRpbk5hbWVUb1BhdGggPSBnZW5lcmF0ZUJ1aWx0aW5zTWFwKGJ1aWx0aW5zKVxuXG5cdFx0dGhpcy5fbGFuZ3VhZ2UgPSBhbGxMYW5ndWFnZXNbdGhpcy5fbGFuZ3VhZ2VdXG5cdFx0aWYgKHRoaXMuX2xhbmd1YWdlID09PSB1bmRlZmluZWQpXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEJhZCBsYW5ndWFnZTogJHt0aGlzLl9sYW5ndWFnZX1gKVxuXHR9XG5cblx0aW5kZW50KCkge1xuXHRcdHJldHVybiB0aGlzLl9pbmRlbnRcblx0fVxuXG5cdGluY2x1ZGVDaGVja3MoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2NoZWNrc1xuXHR9XG5cblx0aW5jbHVkZUFtZGVmaW5lKCkge1xuXHRcdHJldHVybiB0aGlzLl9pbmNsdWRlQW1kZWZpbmVcblx0fVxuXHRpbmNsdWRlU291cmNlTWFwKCkge1xuXHRcdHJldHVybiB0aGlzLl9pbmNsdWRlU291cmNlTWFwXG5cdH1cblx0aW5jbHVkZVVzZVN0cmljdCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fdXNlU3RyaWN0XG5cdH1cblxuXHRsYXp5TW9kdWxlKCkge1xuXHRcdHJldHVybiB0aGlzLl9sYXp5TW9kdWxlc1xuXHR9XG5cblx0aW1wb3J0Qm9vdCgpIHtcblx0XHRyZXR1cm4gdGhpcy5faW1wb3J0Qm9vdFxuXHR9XG5cdGJvb3RQYXRoKCkge1xuXHRcdHJldHVybiBgJHt0aGlzLl9tc2xQYXRofS9wcml2YXRlL2Jvb3RgXG5cdH1cblxuXHRsYW5ndWFnZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5fbGFuZ3VhZ2Vcblx0fVxufVxuXG5mdW5jdGlvbiBnZXREZWZhdWx0QnVpbHRpbnMobXNsUGF0aCkge1xuXHRjb25zdCBidWlsdGlucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRCdWlsdGlucylcblx0aWYgKG1zbFBhdGggIT09ICdtc2wnKVxuXHRcdGZvciAoY29uc3Qga2V5IGluIGJ1aWx0aW5zKSB7XG5cdFx0XHRjb25zdCB4ID0gYnVpbHRpbnNba2V5XVxuXHRcdFx0ZGVsZXRlIGJ1aWx0aW5zW2tleV1cblx0XHRcdGJ1aWx0aW5zW2tleS5yZXBsYWNlKC9tc2wvZywgbXNsUGF0aCldID0geFxuXHRcdH1cblx0cmV0dXJuIGJ1aWx0aW5zXG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlQnVpbHRpbnNNYXAoYnVpbHRpbnMpIHtcblx0Y29uc3QgbSA9IG5ldyBNYXAoKVxuXHRmb3IgKGNvbnN0IHBhdGggaW4gYnVpbHRpbnMpIHtcblx0XHRjb25zdCByZWFsUGF0aCA9IHBhdGgucmVwbGFjZSgvXFwuL2csICcvJylcblx0XHRmb3IgKGxldCBpbXBvcnRlZCBvZiBidWlsdGluc1twYXRoXSkge1xuXHRcdFx0aWYgKGltcG9ydGVkID09PSAnXycpXG5cdFx0XHRcdGltcG9ydGVkID0gbGFzdChwYXRoLnNwbGl0KCcuJykpXG5cdFx0XHRpZiAobS5oYXMoaW1wb3J0ZWQpKVxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEJ1aWx0aW4gJHtpbXBvcnRlZH0gZGVmaW5lZCBtb3JlIHRoYW4gb25jZS5gKVxuXHRcdFx0bS5zZXQoaW1wb3J0ZWQsIHJlYWxQYXRoKVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gbVxufVxuIl19