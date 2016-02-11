(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports);if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", '../token/Group', '../util', './util'], factory);
    }
})(function (require, exports) {
    "use strict";

    const Group_1 = require('../token/Group');
    const util_1 = require('../util');
    const util_2 = require('./util');
    const english = {
        indentedBlock: 'indented block',
        spacedGroup: 'spaced group',
        badInterpolation: `${ util_2.showChar(35) } must be followed by ` + `${ util_2.showChar(40) }, ${ util_2.showChar(35) }, or a name.`,
        badSpacedIndent: indent => `Indentation spaces must be a multiple of ${ indent }.`,
        commentNeedsSpace: 'A comment should start with a space or tab.',
        emptyBlock: 'Empty block.',
        extraSpace: 'Unnecessary space.',
        mismatchedGroupClose: (actual, expected) => `Trying to close ${ util_2.showGroupType(actual, this) }, but last opened ${ util_2.showGroup(expected, this) }.`,
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
        argsCond: `${ util_2.showKeyword(3) } takes exactly 3 arguments.`,
        argsConditional: kind => `${ util_2.showKeyword(kind) } with no block takes exactly 2 arguments.`,
        argsDel: `${ util_2.showKeyword(4) } takes only one argument.`,
        argsTraitDo: `${ util_2.showKeyword(32) } takes 2 arguments: implementor and trait.`,
        asToken: `Expected only 1 token after ${ util_2.showKeyword(35) }.`,
        badAssignee: `Assignee should be exactly 1 token (may be a ${ util_2.showGroupType(Group_1.GroupBrace, this) } group)`,
        caseSwitchNeedsParts: `Must have at least 1 non-${ util_2.showKeyword(43) } test.`,
        expectedAfterAssert: `Expected something after ${ util_2.showKeyword(24) }.`,
        expectedAfterColon: `Expected something after ${ util_2.showKeyword(38) }.`,
        expectedBlock: 'Expected an indented block.',
        expectedExpression: 'Expected an expression, got nothing.',
        expectedImportModuleName: 'Expected a module name to import.',
        expectedKeyword: keyword => `Expected ${ util_2.showKeyword(keyword) }`,
        expectedMethodSplit: 'Expected a function keyword somewhere.',
        expectedOneLocal: 'Expected only one local declaration.',
        expectedLocalName: token => `Expected a local name, not ${ util_2.showToken(token, this) }.`,
        expectedName: token => `Expected a name, not ${ util_2.showToken(token, this) }`,
        extraParens: `Unnecessary ${ util_2.showGroupType(Group_1.GroupParenthesis, this) }`,
        funFocusArgIsImplicit: keyword => `Nothing may come after ${ util_2.showKeyword(keyword) }; function argument is implicitly ${ util_2.showKeyword(46) }.`,
        implicitFunctionDot: `Function ${ util_2.showChar(46) } is implicit for methods.`,
        infiniteRange: `Use ${ util_2.showKeyword(27) } for infinite ranges.`,
        invalidImportModule: 'Not a valid module name.',
        methodName: 'Method name must be exactly one token ' + `(may be a ${ util_2.showGroupType(Group_1.GroupParenthesis, this) } group).`,
        noImportFocus: `${ util_2.showKeyword(46) } not allowed as import name.`,
        noMyOverride: `Method can't be both ${ util_2.showKeyword(52) } and ${ util_2.showKeyword(54) }.`,
        noSpecialKeyword: kind => `${ util_2.code(kind) } is not allowed here.`,
        nothingAfterFinally: `Nothing may come after ${ util_2.showKeyword(45) }.`,
        parensOutsideCall: `Use ${ util_2.code('(a b)') }, not ${ util_2.code('a(b)') }.`,
        reservedWord: name => `Reserved word ${ util_2.code(name) }.`,
        tokenAfterSuper: `Expected ${ util_2.showKeyword(41) } or ${ util_2.code('()') } after ${ util_2.showKeyword(13) }`,
        todoForPattern: 'TODO: pattern in for',
        todoLazyField: 'TODO: lazy fields',
        todoMutateDestructure: 'TODO: LocalDestructureMutate',
        unexpected: token => `Unexpected ${ util_2.showToken(token, this) }.`,
        unexpectedAfter: token => `Did not expect anything after ${ util_2.showToken(token, this) }.`,
        unexpectedAfterImportDo: `This is an ${ util_2.showKeyword(49) }, so you can't import any values.`,
        unexpectedAfterKind: kind => `Did not expect anything between ${ util_2.showKeyword(kind) } and block.`,
        unexpectedAfterPoly: `Did not expect anything between ${ util_2.showKeyword(11) } and function.`,
        ambiguousSK: 'Can\'t tell if this is a statement. Some parts are statements but others are values.',
        ambiguousForSK: `Can't tell if ${ util_2.showKeyword(6) } is a statement. ` + `Some ${ util_2.showKeyword(25) }s have a value, others don't.`,
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
        breakCantHaveValue: `${ util_2.showKeyword(25) } with value needs ${ util_2.showKeyword(6) } to be in expression position.`,
        breakNeedsValue: `${ util_2.showKeyword(6) } in expression position must ${ util_2.showKeyword(25) } with a value.`,
        breakValInForBag: `${ util_2.showKeyword(25) } in ${ util_2.showKeyword(8) } may not have value.`,
        cantDetermineName: 'Expression must be placed in a position where name can be determined.',
        cantInferBlockKind: 'Block has mixed bag/map/obj entries — can not infer type.',
        destructureAllLazy: 'All locals of destructuring assignment must all lazy or all non-lazy.',
        doFuncCantHaveType: 'Function with return type must return something.',
        duplicateImport: (name, prevLoc) => `${ util_2.code(name) } already imported at ${ util_2.showLoc(prevLoc) }`,
        duplicateKey: key => `Duplicate key ${ util_2.code(key) }`,
        duplicateLocal: name => `A local ${ util_2.code(name) } already exists and can't be shadowed.`,
        elseRequiresCatch: `${ util_2.showKeyword(43) } must come after a ${ util_2.showKeyword(37) }.`,
        exportName: 'Module export must have a constant name.',
        forAsyncNeedsAsync: `${ util_2.showKeyword(7) } as statement must be inside an async function.`,
        misplacedAwait: `Cannot ${ util_2.showKeyword(0) } outside of async function.`,
        misplacedBreak: 'Not in a loop.',
        misplacedSpreadDo: `Can not spread here. Did you forget the space after ${ util_2.showKeyword(27) }?`,
        misplacedSpreadVal: `Can only spread in call, ${ util_2.showKeyword(10) }, or ${ util_2.showGroupType(Group_1.GroupBracket, this) }.`,
        misplacedYield: kind => `Cannot ${ util_2.showKeyword(kind) } outside of generator function.`,
        missingLocal: name => `No such local ${ util_2.code(name) }.`,
        noLazyCatch: 'Caught error can not be lazy.',
        noLazyIteratee: 'Iteration element can not be lazy.',
        overriddenBuiltin: (name, builtinPath) => `Local ${ util_2.code(name) } overrides builtin from ${ util_2.code(builtinPath) }.`,
        statementAsValue: 'This can only be used as a statement, but appears in expression context.',
        superForbidden: `Class has no superclass, so ${ util_2.showKeyword(13) } is not allowed.`,
        superMustBeStatement: `${ util_2.showKeyword(13) } in constructor must appear as a statement.'`,
        superNeeded: `Constructor must contain ${ util_2.showKeyword(13) }`,
        superNeedsMethod: `${ util_2.showKeyword(13) } must be in a method.`,
        unusedLocal: name => `Unused local variable ${ util_2.code(name) }.`,
        uselessExcept: `${ util_2.showKeyword(5) } must have ${ util_2.showKeyword(37) } or ${ util_2.showKeyword(45) }.`,
        valueAsStatement: 'Value appears in statement context, so it does nothing.'
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = english;
});
//# sourceMappingURL=english.js.map
