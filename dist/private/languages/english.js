(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../../CompileError', '../lex/chars', '../Token', '../util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var CompileError_1 = require('../../CompileError');
    var chars_1 = require('../lex/chars');
    var Token_1 = require('../Token');
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
        argsCond: `${ Token_1.showKeyword(45) } takes exactly 3 arguments.`,
        argsConditional: kind => `${ Token_1.showKeyword(kind) } with no block takes exactly 2 arguments.`,
        argsDel: `${ Token_1.showKeyword(50) } takes only one argument.`,
        argsTraitDo: `${ Token_1.showKeyword(106) } takes 2 arguments: implementor and trait.`,
        assignNothing: 'Assignment to nothing.',
        asToken: `Expected only 1 token after ${ Token_1.showKeyword(37) }.`,
        caseFocusIsImplicit: 'Can\'t make focus — is implicitly provided as first argument.',
        caseSwitchNeedsParts: `Must have at least 1 non-${ Token_1.showKeyword(55) } test.`,
        destructureAllLazy: 'All locals of destructuring assignment must all lazy or all non-lazy.',
        expectedAfterAssert: `Expected something after ${ Token_1.showKeyword(38) }.`,
        expectedAfterColon: `Expected something after ${ Token_1.showKeyword(47) }.`,
        expectedBlock: 'Expected an indented block.',
        expectedExpression: 'Expected an expression, got nothing.',
        expectedFuncKind: token => `Expected function kind, got ${ token }.`,
        expectedImportModuleName: 'Expected a module name to import.',
        expectedKeyword: keyword => `Expected ${ Token_1.showKeyword(keyword) }`,
        expectedMethodSplit: 'Expected a function keyword somewhere.',
        expectedOneLocal: 'Expected only one local declaration.',
        expectedLocalName: token => `Expected a local name, not ${ token }.`,
        expectedName: token => `Expected a name, not ${ token }`,
        extraParens: `Unnecessary ${ CompileError_1.code('()') }`,
        implicitFunctionDot: `Function ${ chars_1.showChar(chars_1.Char.Dot) } is implicit for methods.`,
        infiniteRange: `Use ${ Token_1.showKeyword(54) } for infinite ranges.`,
        invalidImportModule: 'Not a valid module name.',
        noImportFocus: `${ Token_1.showKeyword(60) } not allowed as import name.`,
        noSpecialKeyword: kind => `${ Token_1.showKeyword(kind) } is not allowed here.`,
        nothingAfterFinally: `Nothing may come after ${ Token_1.showKeyword(59) }.`,
        parensOutsideCall: `Use ${ CompileError_1.code('(a b)') }, not ${ CompileError_1.code('a(b)') }.`,
        reservedWord: token => `Reserved word ${ token }.`,
        switchArgIsImplicit: 'Value to switch on is `_`, the function\'s implicit argument.',
        tokenAfterSuper: `Expected ${ Token_1.showKeyword(52) } or ${ CompileError_1.code('()') } after ${ Token_1.showKeyword(99) }`,
        todoForPattern: 'TODO: pattern in for',
        todoLazyField: 'TODO: lazy fields',
        todoMutateDestructure: 'TODO: LocalDestructureMutate',
        unexpected: token => `Unexpected ${ token }.`,
        unexpectedAfter: token => `Did not expect anything after ${ token }.`,
        unexpectedAfterImportDo: `This is an ${ Token_1.showKeyword(81) }, so you can't import any values.`,
        unexpectedAfterKind: kind => `Did not expect anything between ${ Token_1.showKeyword(kind) } and block.`,
        unexpectedAfterMethod: `Did not expect anything between ${ Token_1.showKeyword(86) } and function.`,
        ambiguousSK: 'Can\'t tell if this is a statement. Some parts are statements but others are values.',
        ambiguousForSK: `Can't tell if ${ Token_1.showKeyword(61) } is a statement. ` + `Some ${ Token_1.showKeyword(41) }s have a value, others don't.`,
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
        breakCantHaveValue: `${ Token_1.showKeyword(41) } with value needs ${ Token_1.showKeyword(61) } to be in expression position.`,
        breakNeedsValue: `${ Token_1.showKeyword(61) } in expression position must ${ Token_1.showKeyword(41) } with a value.`,
        breakValInForBag: `${ Token_1.showKeyword(41) } in ${ Token_1.showKeyword(63) } may not have value.`,
        cantDetermineName: 'Expression must be placed in a position where name can be determined.',
        cantInferBlockKind: 'Block has mixed bag/map/obj entries — can not infer type.',
        doFuncCantHaveType: 'Function with return type must return something.',
        duplicateImport: (name, prevLoc) => `${ CompileError_1.code(name) } already imported at ${ prevLoc }`,
        duplicateKey: key => `Duplicate key ${ key }`,
        duplicateLocal: name => `A local ${ CompileError_1.code(name) } already exists and can't be shadowed.`,
        elseRequiresCatch: `${ Token_1.showKeyword(55) } must come after a ${ Token_1.showKeyword(44) }.`,
        exportName: 'Module export must have a constant name.',
        forAsyncNeedsAsync: `${ Token_1.showKeyword(62) } as statement must be inside an async function.`,
        misplacedAwait: `Cannot ${ Token_1.showKeyword(40) } outside of async function.`,
        misplacedBreak: 'Not in a loop.',
        misplacedSpreadDo: `Can not spread here. Did you forget the space after ${ Token_1.showKeyword(54) }?`,
        misplacedSpreadVal: `Can only spread in call, ${ Token_1.showKeyword(89) }, or ${ CompileError_1.code('[]') }.`,
        misplacedYield: kind => `Cannot ${ Token_1.showKeyword(kind) } outside of generator function.`,
        missingLocal: name => `No such local ${ CompileError_1.code(name) }.`,
        noLazyCatch: 'Caught error can not be lazy.',
        noLazyIteratee: 'Iteration element can not be lazy.',
        overriddenBuiltin: (name, builtinPath) => `Local ${ CompileError_1.code(name) } overrides builtin from ${ CompileError_1.code(builtinPath) }.`,
        statementAsValue: 'This can only be used as a statement, but appears in expression context.',
        superForbidden: `Class has no superclass, so ${ Token_1.showKeyword(99) } is not allowed.`,
        superMustBeStatement: `${ Token_1.showKeyword(99) } in constructor must appear as a statement.'`,
        superNeeded: `Constructor must contain ${ Token_1.showKeyword(99) }`,
        superNeedsMethod: `${ Token_1.showKeyword(99) } must be in a method.`,
        unusedLocal: name => `Unused local variable ${ CompileError_1.code(name) }.`,
        uselessExcept: `${ Token_1.showKeyword(56) } must have ${ Token_1.showKeyword(44) } or ${ Token_1.showKeyword(59) }.`,
        valueAsStatement: 'Value appears in statement context, so it does nothing.'
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = english;
});
//# sourceMappingURL=english.js.map
