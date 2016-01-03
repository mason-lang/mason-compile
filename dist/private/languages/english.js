(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../../CompileError', '../lex/chars', '../token/Keyword', '../util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var CompileError_1 = require('../../CompileError');
    var chars_1 = require('../lex/chars');
    var Keyword_1 = require('../token/Keyword');
    var util_1 = require('../util');
    const english = {
        badInterpolation: `${ CompileError_1.code('#') } must be followed by ${ CompileError_1.code('(') }, ${ CompileError_1.code('#') }, or a name.`,
        badSpacedIndent: indent => `Indentation spaces must be a multiple of ${ indent }.`,
        emptyBlock: 'Empty block.',
        extraSpace: 'Unnecessary space.',
        mismatchedGroupClose: (actual, expected) => `Trying to close ${ actual.prototype.showType() }, but last opened ${ expected.showType() }.`,
        noLeadingSpace: 'Line begins in a space',
        nonLeadingTab: 'Tab may only be used to indent',
        noNewlineInInterpolation: 'Quote interpolation cannot contain newline.',
        reservedChar: char => `Reserved character ${ chars_1.showChar(char) }.`,
        suggestSimpleQuote: name => `Quoted text could be a simple quote ${ CompileError_1.code(`'${ name }`) }.`,
        tooMuchIndent: 'Line is indented more than once.',
        tooMuchIndentQuote: 'Indented quote must have exactly one more indent than previous line.',
        trailingDocComment: `Doc comment must go on its own line. Did you mean ${ CompileError_1.code('||') }?`,
        trailingSpace: 'Line ends in a space.',
        unclosedQuote: 'Unclosed quote.',
        argsCond: `${ Keyword_1.showKeyword(87) } takes exactly 3 arguments.`,
        argsConditional: kind => `${ Keyword_1.showKeyword(kind) } with no block takes exactly 2 arguments.`,
        argsDel: `${ Keyword_1.showKeyword(92) } takes only one argument.`,
        argsTraitDo: `${ Keyword_1.showKeyword(149) } takes 2 arguments: implementor and trait.`,
        assignNothing: 'Assignment to nothing.',
        asToken: `Expected only 1 token after ${ Keyword_1.showKeyword(79) }.`,
        caseFocusIsImplicit: 'Can\'t make focus — is implicitly provided as first argument.',
        caseSwitchNeedsParts: `Must have at least 1 non-${ Keyword_1.showKeyword(97) } test.`,
        destructureAllLazy: 'All locals of destructuring assignment must all lazy or all non-lazy.',
        expectedAfterAssert: `Expected something after ${ Keyword_1.showKeyword(80) }.`,
        expectedAfterColon: `Expected something after ${ Keyword_1.showKeyword(89) }.`,
        expectedBlock: 'Expected an indented block.',
        expectedExpression: 'Expected an expression, got nothing.',
        expectedFuncKind: token => `Expected function kind, got ${ token }.`,
        expectedImportModuleName: 'Expected a module name to import.',
        expectedKeyword: keyword => `Expected ${ Keyword_1.showKeyword(keyword) }`,
        expectedMethodSplit: 'Expected a function keyword somewhere.',
        expectedOneLocal: 'Expected only one local declaration.',
        expectedLocalName: token => `Expected a local name, not ${ token }.`,
        expectedName: token => `Expected a name, not ${ token }`,
        extraParens: `Unnecessary ${ CompileError_1.code('()') }`,
        implicitFunctionDot: `Function ${ chars_1.showChar(46) } is implicit for methods.`,
        infiniteRange: `Use ${ Keyword_1.showKeyword(96) } for infinite ranges.`,
        invalidImportModule: 'Not a valid module name.',
        noImportFocus: `${ Keyword_1.showKeyword(102) } not allowed as import name.`,
        noMyOverride: `Method can't be both ${ Keyword_1.showKeyword(129) } and ${ Keyword_1.showKeyword(136) }.`,
        noSpecialKeyword: kind => `${ Keyword_1.showKeyword(kind) } is not allowed here.`,
        nothingAfterFinally: `Nothing may come after ${ Keyword_1.showKeyword(101) }.`,
        parensOutsideCall: `Use ${ CompileError_1.code('(a b)') }, not ${ CompileError_1.code('a(b)') }.`,
        reservedWord: token => `Reserved word ${ token }.`,
        switchArgIsImplicit: 'Value to switch on is `_`, the function\'s implicit argument.',
        tokenAfterSuper: `Expected ${ Keyword_1.showKeyword(94) } or ${ CompileError_1.code('()') } after ${ Keyword_1.showKeyword(142) }`,
        todoForPattern: 'TODO: pattern in for',
        todoLazyField: 'TODO: lazy fields',
        todoMutateDestructure: 'TODO: LocalDestructureMutate',
        unexpected: token => `Unexpected ${ token }.`,
        unexpectedAfter: token => `Did not expect anything after ${ token }.`,
        unexpectedAfterImportDo: `This is an ${ Keyword_1.showKeyword(123) }, so you can't import any values.`,
        unexpectedAfterKind: kind => `Did not expect anything between ${ Keyword_1.showKeyword(kind) } and block.`,
        unexpectedAfterMethod: `Did not expect anything between ${ Keyword_1.showKeyword(128) } and function.`,
        ambiguousSK: 'Can\'t tell if this is a statement. Some parts are statements but others are values.',
        ambiguousForSK: `Can't tell if ${ Keyword_1.showKeyword(103) } is a statement. ` + `Some ${ Keyword_1.showKeyword(83) }s have a value, others don't.`,
        argsLogic: 'Logic expression needs at least 2 arguments.',
        badRegExp: source => {
            try {
                new RegExp(source);
                util_1.assert(false);
                return '';
            } catch (err) {
                return err.message;
            }
        },
        blockNeedsContent: 'Value block must have some content.',
        breakCantHaveValue: `${ Keyword_1.showKeyword(83) } with value needs ${ Keyword_1.showKeyword(103) } to be in expression position.`,
        breakNeedsValue: `${ Keyword_1.showKeyword(103) } in expression position must ${ Keyword_1.showKeyword(83) } with a value.`,
        breakValInForBag: `${ Keyword_1.showKeyword(83) } in ${ Keyword_1.showKeyword(105) } may not have value.`,
        cantDetermineName: 'Expression must be placed in a position where name can be determined.',
        cantInferBlockKind: 'Block has mixed bag/map/obj entries — can not infer type.',
        doFuncCantHaveType: 'Function with return type must return something.',
        duplicateImport: (name, prevLoc) => `${ CompileError_1.code(name) } already imported at ${ prevLoc }`,
        duplicateKey: key => `Duplicate key ${ key }`,
        duplicateLocal: name => `A local ${ CompileError_1.code(name) } already exists and can't be shadowed.`,
        elseRequiresCatch: `${ Keyword_1.showKeyword(97) } must come after a ${ Keyword_1.showKeyword(86) }.`,
        exportName: 'Module export must have a constant name.',
        forAsyncNeedsAsync: `${ Keyword_1.showKeyword(104) } as statement must be inside an async function.`,
        misplacedAwait: `Cannot ${ Keyword_1.showKeyword(82) } outside of async function.`,
        misplacedBreak: 'Not in a loop.',
        misplacedSpreadDo: `Can not spread here. Did you forget the space after ${ Keyword_1.showKeyword(96) }?`,
        misplacedSpreadVal: `Can only spread in call, ${ Keyword_1.showKeyword(131) }, or ${ CompileError_1.code('[]') }.`,
        misplacedYield: kind => `Cannot ${ Keyword_1.showKeyword(kind) } outside of generator function.`,
        missingLocal: name => `No such local ${ CompileError_1.code(name) }.`,
        noLazyCatch: 'Caught error can not be lazy.',
        noLazyIteratee: 'Iteration element can not be lazy.',
        overriddenBuiltin: (name, builtinPath) => `Local ${ CompileError_1.code(name) } overrides builtin from ${ CompileError_1.code(builtinPath) }.`,
        statementAsValue: 'This can only be used as a statement, but appears in expression context.',
        superForbidden: `Class has no superclass, so ${ Keyword_1.showKeyword(142) } is not allowed.`,
        superMustBeStatement: `${ Keyword_1.showKeyword(142) } in constructor must appear as a statement.'`,
        superNeeded: `Constructor must contain ${ Keyword_1.showKeyword(142) }`,
        superNeedsMethod: `${ Keyword_1.showKeyword(142) } must be in a method.`,
        unusedLocal: name => `Unused local variable ${ CompileError_1.code(name) }.`,
        uselessExcept: `${ Keyword_1.showKeyword(98) } must have ${ Keyword_1.showKeyword(86) } or ${ Keyword_1.showKeyword(101) }.`,
        valueAsStatement: 'Value appears in statement context, so it does nothing.'
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = english;
});
//# sourceMappingURL=english.js.map
