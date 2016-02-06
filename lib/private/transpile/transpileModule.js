var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", 'esast/lib/Declaration', 'esast/lib/Expression', 'esast/lib/Function', 'esast/lib/Identifier', 'esast/lib/Literal', 'esast/lib/Program', 'esast/lib/Statement', 'esast-create-util/lib/util', 'op/Op', '../context', '../manglePath', '../ast/locals', '../ast/Module', '../util', './context', './esast-constants', './ms', './transpileLocals', './transpileVal', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Declaration_1 = require('esast/lib/Declaration');
    const Expression_1 = require('esast/lib/Expression');
    const Function_1 = require('esast/lib/Function');
    const Identifier_1 = require('esast/lib/Identifier');
    const Literal_1 = require('esast/lib/Literal');
    const Program_1 = require('esast/lib/Program');
    const Statement_1 = require('esast/lib/Statement');
    const util_1 = require('esast-create-util/lib/util');
    const Op_1 = require('op/Op');
    const context_1 = require('../context');
    const manglePath_1 = require('../manglePath');
    const locals_1 = require('../ast/locals');
    const Module_1 = require('../ast/Module');
    const util_2 = require('../util');
    const context_2 = require('./context');
    const esast_constants_1 = require('./esast-constants');
    const ms_1 = require('./ms');
    const transpileLocals_1 = require('./transpileLocals');
    const transpileVal_1 = require('./transpileVal');
    const util_3 = require('./util');
    function transpileModule(_) {
        const doImports = _.doImports;
        const lines = _.lines;

        const body = moduleBody(context_2.verifyResults.moduleKind, lines);
        if (context_1.compileOptions.noModuleBoilerplate) return new Program_1.Script(body);
        const amd = amdWrapModule(doImports, transpiledImports(_), body);
        return util_3.loc(_, new Program_1.Script(util_2.cat(Op_1.opIf(context_1.compileOptions.useStrict, () => useStrict), Op_1.opIf(context_1.compileOptions.includeAmdefine, () => amdefineHeader), amd)));
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = transpileModule;
    function transpiledImports(_) {
        const imports = _.imports;

        const res = imports.filter(_ => _.path !== 'global');
        for (const _ref of context_2.verifyResults.builtinPathToNames) {
            var _ref2 = _slicedToArray(_ref, 2);

            const path = _ref2[0];
            const imported = _ref2[1];

            if (path !== 'global') {
                const importedDeclares = [];
                let opImportDefault = null;
                const defaultName = util_2.last(path.split('/'));
                for (const name of imported) {
                    const declare = locals_1.LocalDeclare.plain(_.loc, name);
                    if (name === defaultName) opImportDefault = declare;else importedDeclares.push(declare);
                }
                res.push(new Module_1.Import(_.loc, path, importedDeclares, opImportDefault));
            }
        }return res;
    }
    function moduleBody(kind, lines) {
        switch (kind) {
            case 0:
            case 2:
                return util_3.transpileLines(lines);
            case 1:
                const dos = util_3.transpileLines(util_2.rtail(lines));
                const val = transpileVal_1.default(util_2.last(lines));
                if (context_1.compileOptions.noModuleBoilerplate) return util_2.cat(dos, new Statement_1.ExpressionStatement(val));else return util_2.cat(dos, new Statement_1.ExpressionStatement(exportDefault(val)));
            case 3:
            case 4:
                {
                    const declare = kind === 3 ? esast_constants_1.declareBuiltBag : esast_constants_1.declareBuiltMap;
                    const dos = util_3.transpileLines(lines);
                    if (context_1.compileOptions.noModuleBoilerplate) return util_2.cat(declare, dos);else return util_2.cat(declare, dos, new Statement_1.ExpressionStatement(exportDefault(esast_constants_1.idBuilt)));
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
        return new Expression_1.AssignmentExpression('=', util_1.member(idExports, name), val);
    }
    function exportDefault(val) {
        return new Expression_1.AssignmentExpression('=', exportsDefault, val);
    }
    function amdWrapModule(doImports, imports, body) {
        const shouldImportBoot = context_1.compileOptions.importBoot;
        const allImports = doImports.concat(imports);
        const allImportPaths = allImports.map(_ => manglePath_1.default(_.path));
        const arrImportPaths = new Expression_1.ArrayExpression(util_2.cat(litStrExports, Op_1.opIf(shouldImportBoot, () => new Literal_1.LiteralString(context_1.compileOptions.bootPath)), allImportPaths.map(_ => new Literal_1.LiteralString(_))));
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
        const importArgs = util_2.cat(idExports, Op_1.opIf(shouldImportBoot, () => idBoot), importIdentifiers);
        const doBoot = Op_1.opIf(shouldImportBoot, () => new Statement_1.ExpressionStatement(ms_1.msCall('getModule', idBoot)));
        const importDos = doImports.map(_ => util_3.loc(_, new Statement_1.ExpressionStatement(ms_1.msCall('getModule', getIdentifier(_)))));
        const opDeclareImportedLocals = Op_1.opIf(!util_2.isEmpty(imports), () => new Declaration_1.VariableDeclarationLet(util_2.flatMap(imports, _ => importDeclarators(_, getIdentifier(_)))));
        const fullBody = new Statement_1.BlockStatement(util_2.cat(doBoot, importDos, opDeclareImportedLocals, body, returnExports));
        const lazyBody = context_1.compileOptions.lazyModules ? new Statement_1.BlockStatement([new Statement_1.ExpressionStatement(new Expression_1.AssignmentExpression('=', exportsGet, ms_1.msCall('lazy', new Function_1.ArrowFunctionExpression([], fullBody))))]) : fullBody;
        return new Statement_1.ExpressionStatement(new Expression_1.CallExpression(idDefine, [arrImportPaths, new Function_1.ArrowFunctionExpression(importArgs, lazyBody)]));
    }
    function pathBaseName(path) {
        return path.substr(path.lastIndexOf('/') + 1);
    }
    function importDeclarators(_ref3, moduleIdentifier) {
        let imported = _ref3.imported;
        let opImportDefault = _ref3.opImportDefault;

        const isLazy = (util_2.isEmpty(imported) ? opImportDefault : imported[0]).isLazy;
        const value = ms_1.msCall(isLazy ? 'lazyGetModule' : 'getModule', moduleIdentifier);
        const importedDefault = Op_1.opMap(opImportDefault, def => {
            const defexp = ms_1.msCall('getDefaultExport', moduleIdentifier);
            const val = isLazy ? util_3.lazyWrap(defexp) : defexp;
            return util_3.loc(def, new Declaration_1.VariableDeclarator(transpileLocals_1.idForDeclareCached(def), val));
        });
        const importedDestruct = util_2.isEmpty(imported) ? null : transpileLocals_1.makeDestructureDeclarators(imported, isLazy, value, true);
        return util_2.cat(importedDefault, importedDestruct);
    }
    const idBoot = new Identifier_1.default('_boot');
    const idDefine = new Identifier_1.default('define');
    const idExports = new Identifier_1.default('exports');
    const exportsGet = util_1.member(idExports, '_get');
    const litStrExports = new Literal_1.LiteralString('exports');
    const returnExports = new Statement_1.ReturnStatement(idExports);
    const useStrict = new Statement_1.ExpressionStatement(new Literal_1.LiteralString('use strict'));
    const amdefineHeader = new Statement_1.IfStatement(new Expression_1.BinaryExpression('!==', new Expression_1.UnaryExpression('typeof', idDefine), new Literal_1.LiteralString('function')), new Declaration_1.VariableDeclarationVar([new Declaration_1.VariableDeclarator(idDefine, new Expression_1.CallExpression(new Expression_1.CallExpression(new Identifier_1.default('require'), [new Literal_1.LiteralString('amdefine')]), [new Identifier_1.default('module')]))]));
    const exportsDefault = util_1.member(idExports, 'default');
});
//# sourceMappingURL=transpileModule.js.map
