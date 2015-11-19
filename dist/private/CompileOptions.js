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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJDb21waWxlT3B0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbXX0=