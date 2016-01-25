(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../util', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    var util_1 = require('../util');
    var util_2 = require('./util');
    const english = {
        badInterpolation: `${ util_2.code('#') } must be followed by ${ util_2.code('(') }, ${ util_2.code('#') }, or a name.`,
        badSpacedIndent: indent => `Indentation spaces must be a multiple of ${ indent }.`,
        emptyBlock: 'Empty block.',
        extraSpace: 'Unnecessary space.',
        mismatchedGroupClose: (actual, expected) => `Trying to close ${ actual.prototype.showType() }, but last opened ${ expected.showType() }.`,
        noLeadingSpace: 'Line begins in a space',
        nonLeadingTab: 'Tab may only be used to indent',
        noNewlineInInterpolation: 'Quote interpolation cannot contain newline.',
        reservedChar: char => `Reserved character ${ util_2.showChar(char) }.`,
        suggestSimpleQuote: name => `Quoted text could be a simple quote ${ util_2.code(`'${ name }`) }.`,
        tooMuchIndent: 'Line is indented more than once.',
        tooMuchIndentQuote: 'Indented quote must have exactly one more indent than previous line.',
        trailingDocComment: `Doc comment must go on its own line. Did you mean ${ util_2.code('||') }?`,
        trailingSpace: 'Line ends in a space.',
        unclosedQuote: 'Unclosed quote.',
        argsCond: `${ util_2.showKeyword(94) } takes exactly 3 arguments.`,
        argsConditional: kind => `${ util_2.showKeyword(kind) } with no block takes exactly 2 arguments.`,
        argsDel: `${ util_2.showKeyword(99) } takes only one argument.`,
        argsTraitDo: `${ util_2.showKeyword(168) } takes 2 arguments: implementor and trait.`,
        assignNothing: 'Assignment to nothing.',
        asToken: `Expected only 1 token after ${ util_2.showKeyword(86) }.`,
        caseSwitchNeedsParts: `Must have at least 1 non-${ util_2.showKeyword(104) } test.`,
        destructureAllLazy: 'All locals of destructuring assignment must all lazy or all non-lazy.',
        expectedAfterAssert: `Expected something after ${ util_2.showKeyword(87) }.`,
        expectedAfterColon: `Expected something after ${ util_2.showKeyword(96) }.`,
        expectedBlock: 'Expected an indented block.',
        expectedExpression: 'Expected an expression, got nothing.',
        expectedImportModuleName: 'Expected a module name to import.',
        expectedKeyword: keyword => `Expected ${ util_2.showKeyword(keyword) }`,
        expectedMethodSplit: 'Expected a function keyword somewhere.',
        expectedOneLocal: 'Expected only one local declaration.',
        expectedLocalName: token => `Expected a local name, not ${ token }.`,
        expectedName: token => `Expected a name, not ${ token }`,
        extraParens: `Unnecessary ${ util_2.code('()') }`,
        funFocusArgIsImplicit: keyword => `Nothing may come after ${ util_2.showKeyword(keyword) }; function argument is implicitly ${ util_2.showKeyword(109) }.`,
        implicitFunctionDot: `Function ${ util_2.showChar(46) } is implicit for methods.`,
        infiniteRange: `Use ${ util_2.showKeyword(103) } for infinite ranges.`,
        invalidImportModule: 'Not a valid module name.',
        noImportFocus: `${ util_2.showKeyword(109) } not allowed as import name.`,
        noMyOverride: `Method can't be both ${ util_2.showKeyword(136) } and ${ util_2.showKeyword(156) }.`,
        noSpecialKeyword: kind => `${ util_2.showKeyword(kind) } is not allowed here.`,
        nothingAfterFinally: `Nothing may come after ${ util_2.showKeyword(108) }.`,
        parensOutsideCall: `Use ${ util_2.code('(a b)') }, not ${ util_2.code('a(b)') }.`,
        reservedWord: token => `Reserved word ${ token }.`,
        tokenAfterSuper: `Expected ${ util_2.showKeyword(101) } or ${ util_2.code('()') } after ${ util_2.showKeyword(161) }`,
        todoForPattern: 'TODO: pattern in for',
        todoLazyField: 'TODO: lazy fields',
        todoMutateDestructure: 'TODO: LocalDestructureMutate',
        unexpected: token => `Unexpected ${ token }.`,
        unexpectedAfter: token => `Did not expect anything after ${ token }.`,
        unexpectedAfterImportDo: `This is an ${ util_2.showKeyword(130) }, so you can't import any values.`,
        unexpectedAfterKind: kind => `Did not expect anything between ${ util_2.showKeyword(kind) } and block.`,
        unexpectedAfterMethod: `Did not expect anything between ${ util_2.showKeyword(135) } and function.`,
        ambiguousSK: 'Can\'t tell if this is a statement. Some parts are statements but others are values.',
        ambiguousForSK: `Can't tell if ${ util_2.showKeyword(110) } is a statement. ` + `Some ${ util_2.showKeyword(90) }s have a value, others don't.`,
        argsOperator: numProvidedArgs => `Operator should have multiple arguments, got ${ numProvidedArgs }`,
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
        breakCantHaveValue: `${ util_2.showKeyword(90) } with value needs ${ util_2.showKeyword(110) } to be in expression position.`,
        breakNeedsValue: `${ util_2.showKeyword(110) } in expression position must ${ util_2.showKeyword(90) } with a value.`,
        breakValInForBag: `${ util_2.showKeyword(90) } in ${ util_2.showKeyword(112) } may not have value.`,
        cantDetermineName: 'Expression must be placed in a position where name can be determined.',
        cantInferBlockKind: 'Block has mixed bag/map/obj entries — can not infer type.',
        doFuncCantHaveType: 'Function with return type must return something.',
        duplicateImport: (name, prevLoc) => `${ util_2.code(name) } already imported at ${ prevLoc }`,
        duplicateKey: key => `Duplicate key ${ key }`,
        duplicateLocal: name => `A local ${ util_2.code(name) } already exists and can't be shadowed.`,
        elseRequiresCatch: `${ util_2.showKeyword(104) } must come after a ${ util_2.showKeyword(93) }.`,
        exportName: 'Module export must have a constant name.',
        forAsyncNeedsAsync: `${ util_2.showKeyword(111) } as statement must be inside an async function.`,
        misplacedAwait: `Cannot ${ util_2.showKeyword(89) } outside of async function.`,
        misplacedBreak: 'Not in a loop.',
        misplacedSpreadDo: `Can not spread here. Did you forget the space after ${ util_2.showKeyword(103) }?`,
        misplacedSpreadVal: `Can only spread in call, ${ util_2.showKeyword(138) }, or ${ util_2.code('[]') }.`,
        misplacedYield: kind => `Cannot ${ util_2.showKeyword(kind) } outside of generator function.`,
        missingLocal: name => `No such local ${ util_2.code(name) }.`,
        noLazyCatch: 'Caught error can not be lazy.',
        noLazyIteratee: 'Iteration element can not be lazy.',
        overriddenBuiltin: (name, builtinPath) => `Local ${ util_2.code(name) } overrides builtin from ${ util_2.code(builtinPath) }.`,
        statementAsValue: 'This can only be used as a statement, but appears in expression context.',
        superForbidden: `Class has no superclass, so ${ util_2.showKeyword(161) } is not allowed.`,
        superMustBeStatement: `${ util_2.showKeyword(161) } in constructor must appear as a statement.'`,
        superNeeded: `Constructor must contain ${ util_2.showKeyword(161) }`,
        superNeedsMethod: `${ util_2.showKeyword(161) } must be in a method.`,
        unusedLocal: name => `Unused local variable ${ util_2.code(name) }.`,
        uselessExcept: `${ util_2.showKeyword(105) } must have ${ util_2.showKeyword(93) } or ${ util_2.showKeyword(108) }.`,
        valueAsStatement: 'Value appears in statement context, so it does nothing.'
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = english;
});
//# sourceMappingURL=english.js.map
