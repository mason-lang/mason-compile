var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/ast', 'esast-create-util/lib/util', 'op/Op', '../context', '../manglePath', '../MsAst', '../util', './ast-constants', './context', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var ast_1 = require('esast/lib/ast');
    var util_1 = require('esast-create-util/lib/util');
    var Op_1 = require('op/Op');
    var context_1 = require('../context');
    var manglePath_1 = require('../manglePath');
    var MsAst_1 = require('../MsAst');
    var util_2 = require('../util');
    var ast_constants_1 = require('./ast-constants');
    var context_2 = require('./context');
    var util_3 = require('./util');
    function default_1() {
        const body = moduleBody(context_2.verifyResults.moduleKind, this.lines);
        const imports = this.imports.filter(_ => _.path !== 'global');
        for (const _ref of context_2.verifyResults.builtinPathToNames) {
            var _ref2 = _slicedToArray(_ref, 2);

            const path = _ref2[0];
            const imported = _ref2[1];

            if (path !== 'global') {
                const importedDeclares = [];
                let opImportDefault = null;
                const defaultName = util_2.last(path.split('/'));
                for (const name of imported) {
                    const declare = MsAst_1.LocalDeclare.plain(this.loc, name);
                    if (name === defaultName) opImportDefault = declare;else importedDeclares.push(declare);
                }
                imports.push(new MsAst_1.Import(this.loc, path, importedDeclares, opImportDefault));
            }
        }const amd = amdWrapModule(this.doImports, imports, body);
        return new ast_1.Script(util_2.cat(Op_1.opIf(context_1.options.useStrict, () => UseStrict), Op_1.opIf(context_1.options.includeAmdefine, () => AmdefineHeader), util_1.toLineContent(amd)));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    function moduleBody(kind, lines) {
        switch (kind) {
            case 0:
            case 2:
                return util_3.tLines(lines);
            case 1:
                {
                    const a = util_3.tLines(util_2.rtail(lines));
                    const b = util_3.t0(util_2.last(lines));
                    return util_2.cat(a, exportDefault(b));
                }
            case 3:
            case 4:
                {
                    const declare = kind === 3 ? ast_constants_1.DeclareBuiltBag : ast_constants_1.DeclareBuiltMap;
                    return util_2.cat(declare, util_3.tLines(lines), exportDefault(ast_constants_1.IdBuilt));
                }
            default:
                throw new Error(String(context_2.verifyResults.moduleKind));
        }
    }
    function exportNamedOrDefault(val, name) {
        return name === context_1.pathOptions.moduleName ? exportDefault(val) : exportNamed(val, name);
    }
    exports.exportNamedOrDefault = exportNamedOrDefault;
    function exportNamed(val, name) {
        return new ast_1.AssignmentExpression('=', util_1.member(ast_constants_1.IdExports, name), val);
    }
    function exportDefault(val) {
        return new ast_1.AssignmentExpression('=', ExportsDefault, val);
    }
    function amdWrapModule(doImports, imports, body) {
        const shouldImportBoot = context_1.options.importBoot;
        const allImports = doImports.concat(imports);
        const allImportPaths = allImports.map(_ => manglePath_1.default(_.path));
        const arrImportPaths = new ast_1.ArrayExpression(util_2.cat(LitStrExports, Op_1.opIf(shouldImportBoot, () => new ast_1.LiteralString(context_1.options.bootPath)), allImportPaths.map(_ => new ast_1.LiteralString(_))));
        const importToIdentifier = new Map();
        const importIdentifiers = [];
        for (let i = 0; i < allImports.length; i = i + 1) {
            const _ = allImports[i];
            const id = util_1.identifier(`${ pathBaseName(_.path) }_${ i }`);
            importIdentifiers.push(id);
            importToIdentifier.set(_, id);
        }
        function getIdentifier(_) {
            return importToIdentifier.get(_);
        }
        const importArgs = util_2.cat(ast_constants_1.IdExports, Op_1.opIf(shouldImportBoot, () => IdBoot), importIdentifiers);
        const doBoot = Op_1.opIf(shouldImportBoot, () => new ast_1.ExpressionStatement(util_3.msCall('getModule', IdBoot)));
        const importDos = doImports.map(_ => util_1.loc(new ast_1.ExpressionStatement(util_3.msCall('getModule', getIdentifier(_))), _.loc));
        const opDeclareImportedLocals = Op_1.opIf(!util_2.isEmpty(imports), () => new ast_1.VariableDeclaration('let', util_2.flatMap(imports, _ => importDeclarators(_, getIdentifier(_)))));
        const fullBody = new ast_1.BlockStatement(util_2.cat(doBoot, importDos, opDeclareImportedLocals, body, ReturnExports));
        const lazyBody = context_1.options.lazyModules ? new ast_1.BlockStatement([new ast_1.ExpressionStatement(new ast_1.AssignmentExpression('=', ExportsGet, util_3.msCall('lazy', new ast_1.ArrowFunctionExpression([], fullBody))))]) : fullBody;
        return new ast_1.CallExpression(IdDefine, [arrImportPaths, new ast_1.ArrowFunctionExpression(importArgs, lazyBody)]);
    }
    function pathBaseName(path) {
        return path.substr(path.lastIndexOf('/') + 1);
    }
    function importDeclarators(_ref3, moduleIdentifier) {
        let imported = _ref3.imported;
        let opImportDefault = _ref3.opImportDefault;

        const isLazy = (util_2.isEmpty(imported) ? opImportDefault : imported[0]).isLazy;
        const value = util_3.msCall(isLazy ? 'lazyGetModule' : 'getModule', moduleIdentifier);
        const importedDefault = Op_1.opMap(opImportDefault, def => {
            const defexp = util_3.msCall('getDefaultExport', moduleIdentifier);
            const val = isLazy ? util_3.lazyWrap(defexp) : defexp;
            return util_1.loc(new ast_1.VariableDeclarator(util_3.idForDeclareCached(def), val), def.loc);
        });
        const importedDestruct = util_2.isEmpty(imported) ? null : util_3.makeDestructureDeclarators(imported, isLazy, value, true);
        return util_2.cat(importedDefault, importedDestruct);
    }
    const IdBoot = new ast_1.Identifier('_boot');
    const IdDefine = new ast_1.Identifier('define');
    const ExportsGet = util_1.member(ast_constants_1.IdExports, '_get');
    const LitStrExports = new ast_1.LiteralString('exports');
    const ReturnExports = new ast_1.ReturnStatement(ast_constants_1.IdExports);
    const UseStrict = new ast_1.ExpressionStatement(new ast_1.LiteralString('use strict'));
    const AmdefineHeader = new ast_1.IfStatement(new ast_1.BinaryExpression('!==', new ast_1.UnaryExpression('typeof', IdDefine), new ast_1.LiteralString('function')), new ast_1.VariableDeclaration('var', [new ast_1.VariableDeclarator(IdDefine, new ast_1.CallExpression(new ast_1.CallExpression(new ast_1.Identifier('require'), [new ast_1.LiteralString('amdefine')]), [new ast_1.Identifier('module')]))]));
    const ExportsDefault = util_1.member(ast_constants_1.IdExports, 'default');
});
//# sourceMappingURL=transpileModule.js.map
