var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'op/Op', '../ast/locals', '../ast/Module', '../context', '../token/Group', '../token/Keyword', './checks', './parseBlock', './parseLine', './parseLocalDeclares', './parseName', './Slice', './tryTakeComment'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Op_1 = require('op/Op');
    const locals_1 = require('../ast/locals');
    const Module_1 = require('../ast/Module');
    const context_1 = require('../context');
    const Group_1 = require('../token/Group');
    const Keyword_1 = require('../token/Keyword');
    const checks_1 = require('./checks');
    const parseBlock_1 = require('./parseBlock');
    const parseLine_1 = require('./parseLine');
    const parseLocalDeclares_1 = require('./parseLocalDeclares');
    const parseName_1 = require('./parseName');
    const Slice_1 = require('./Slice');
    const tryTakeComment_1 = require('./tryTakeComment');
    function parseModule(lines) {
        var _tryTakeComment_1$def = tryTakeComment_1.default(lines);

        var _tryTakeComment_1$def2 = _slicedToArray(_tryTakeComment_1$def, 2);

        const opComment = _tryTakeComment_1$def2[0];
        const rest0 = _tryTakeComment_1$def2[1];

        var _takeImportDos = takeImportDos(rest0);

        var _takeImportDos2 = _slicedToArray(_takeImportDos, 2);

        const doImports = _takeImportDos2[0];
        const rest1 = _takeImportDos2[1];

        var _takeImports = takeImports(129, rest1);

        var _takeImports2 = _slicedToArray(_takeImports, 2);

        const plainImports = _takeImports2[0];
        const rest2 = _takeImports2[1];

        var _takeImports3 = takeImports(131, rest2);

        var _takeImports4 = _slicedToArray(_takeImports3, 2);

        const lazyImports = _takeImports4[0];
        const rest3 = _takeImports4[1];

        const moduleLines = parseLine_1.parseLines(rest3);
        const imports = plainImports.concat(lazyImports);
        return new Module_1.default(lines.loc, context_1.pathOptions.moduleName, opComment, doImports, imports, moduleLines);
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = parseModule;
    function takeImports(importKeywordKind, lines) {
        if (!lines.isEmpty()) {
            const line = lines.headSlice();
            if (Keyword_1.isKeyword(importKeywordKind, line.head())) return [parseImports(importKeywordKind, line.tail()), lines.tail()];
        }
        return [[], lines];
    }
    function parseImports(importKeywordKind, tokens) {
        const lines = parseBlock_1.justBlock(importKeywordKind, tokens);
        return lines.mapSlices(line => {
            var _parseRequire = parseRequire(line.head());

            const path = _parseRequire.path;
            const name = _parseRequire.name;

            const rest = line.tail();

            var _parseThingsImported = parseThingsImported(rest, name, importKeywordKind === 131);

            const imported = _parseThingsImported.imported;
            const opImportDefault = _parseThingsImported.opImportDefault;

            return new Module_1.Import(line.loc, path, imported, opImportDefault);
        });
    }
    function takeImportDos(lines) {
        if (!lines.isEmpty()) {
            const line = lines.headSlice();
            if (Keyword_1.isKeyword(130, line.head())) return [parseImportDos(line.tail()), lines.tail()];
        }
        return [[], lines];
    }
    function parseImportDos(tokens) {
        const lines = parseBlock_1.justBlock(130, tokens);
        return lines.mapSlices(line => {
            var _takeRequire = takeRequire(line);

            var _takeRequire2 = _slicedToArray(_takeRequire, 2);

            const path = _takeRequire2[0].path;
            const rest = _takeRequire2[1];

            checks_1.checkEmpty(rest, _ => _.unexpectedAfterImportDo);
            return new Module_1.ImportDo(line.loc, path);
        });
    }
    function parseThingsImported(tokens, name, isLazy) {
        const importDefault = () => locals_1.LocalDeclare.untyped(tokens.loc, name, isLazy ? 1 : 0);
        if (tokens.isEmpty()) return { imported: [], opImportDefault: importDefault() };else {
            var _ref = Keyword_1.isKeyword(109, tokens.head()) ? [importDefault(), tokens.tail()] : [null, tokens];

            var _ref2 = _slicedToArray(_ref, 2);

            const opImportDefault = _ref2[0];
            const rest = _ref2[1];

            const imported = parseLocalDeclares_1.parseLocalDeclaresJustNames(rest).map(l => {
                context_1.check(l.name !== '_', l.loc, _ => _.noImportFocus);
                if (isLazy) l.kind = 1;
                return l;
            });
            return { imported: imported, opImportDefault: opImportDefault };
        }
    }
    function takeRequire(tokens) {
        return [parseRequire(tokens.head()), tokens.tail()];
    }
    function parseRequire(token) {
        return Op_1.caseOp(parseName_1.tryParseName(token), name => ({ path: name, name: name }), () => {
            if (token instanceof Group_1.GroupSpace) {
                const tokens = Slice_1.Tokens.of(token);
                let rest = tokens;
                const parts = [];
                const head = rest.head();
                Op_1.opEach(tryTakeNDots(head), n => {
                    parts.push('.');
                    for (let i = 1; i < n; i = i + 1) parts.push('..');
                    rest = rest.tail();
                    while (!rest.isEmpty()) {
                        const n = tryTakeNDots(rest.head());
                        if (n === null) break;else {
                            for (let i = 0; i < n; i = i + 1) parts.push('..');
                            rest = rest.tail();
                        }
                    }
                });
                while (true) {
                    checks_1.checkNonEmpty(rest, _ => _.expectedImportModuleName);
                    parts.push(parseName_1.default(rest.head()));
                    rest = rest.tail();
                    if (rest.isEmpty()) break;
                    checks_1.checkKeyword(101, rest.head());
                    rest = rest.tail();
                }
                return { path: parts.join('/'), name: parts[parts.length - 1] };
            } else context_1.fail(token.loc, _ => _.invalidImportModule);
        });
    }
    function tryTakeNDots(token) {
        if (token instanceof Keyword_1.default) switch (token.kind) {
            case 101:
                return 1;
            case 102:
                return 2;
            case 103:
                return 3;
            default:
                return null;
        } else return null;
    }
});
//# sourceMappingURL=parseModule.js.map
