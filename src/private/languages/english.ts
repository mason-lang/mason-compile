import Loc from 'esast/lib/Loc'
import Char from 'typescript-char/Char'
import Token from '../token/Token'
import Group, {GroupBrace, GroupBracket, GroupParenthesis, GroupType} from '../token/Group'
import {Keywords} from '../token/Keyword'
import {assert} from '../util'
import Language from './Language'
import {code, showChar, showGroup, showGroupType, showKeyword as kw, showLoc, showToken
	} from './util'

const english: Language = {
	// Lex:

	badInterpolation:
		`${showChar(Char.Hash)} must be followed by ` +
		`${showChar(Char.OpenParenthesis)}, ${showChar(Char.Hash)}, or a name.`,
	badSpacedIndent: (indent: number): string =>
		`Indentation spaces must be a multiple of ${indent}.`,
	commentNeedsSpace:
		'A comment should start with a space or tab.',
	emptyBlock:
		'Empty block.',
	extraSpace:
		'Unnecessary space.',
	mismatchedGroupClose: (actual: GroupType, expected: Group<Token>): string =>
		`Trying to close ${showGroupType(actual)}, but last opened ${showGroup(expected)}.`,
	noLeadingSpace:
		'Line begins in a space',
	nonLeadingTab:
		'Tab may only be used to indent',
	noNewlineInInterpolation:
		'Quote interpolation cannot contain newline.',
	reservedChar: (char: Char): string =>
		`Reserved character ${showChar(char)}.`,
	suggestSimpleQuote: (name: string): string =>
		`Quoted text could be a simple quote ${code(`'${name}`)}.`,
	tooMuchIndent:
		'Line is indented more than once.',
	tooMuchIndentQuote:
		'Indented quote must have exactly one more indent than previous line.',
	trailingDocComment:
		`Doc comment must go on its own line. Did you mean ${code('||')}?`,
	trailingSpace:
		'Line ends in a space.',
	unclosedQuote:
		'Unclosed quote.',

	// Parse:

	argsCond:
		`${kw(Keywords.Cond)} takes exactly 3 arguments.`,
	argsConditional: (kind: Keywords): string =>
		`${kw(kind)} with no block takes exactly 2 arguments.`,
	argsDel:
		`${kw(Keywords.Del)} takes only one argument.`,
	argsTraitDo:
		`${kw(Keywords.TraitDo)} takes 2 arguments: implementor and trait.`,
	asToken:
		`Expected only 1 token after ${kw(Keywords.As)}.`,
	badAssignee:
		`Assignee should be exactly 1 token (may be a ${showGroupType(GroupBrace)} group)`,
	caseSwitchNeedsParts:
		`Must have at least 1 non-${kw(Keywords.Else)} test.`,
	expectedAfterAssert:
		`Expected something after ${kw(Keywords.Assert)}.`,
	expectedAfterColon:
		`Expected something after ${kw(Keywords.Colon)}.`,
	expectedBlock:
		'Expected an indented block.',
	expectedExpression:
		'Expected an expression, got nothing.',
	expectedImportModuleName:
		'Expected a module name to import.',
	expectedKeyword: (keyword: Keywords): string =>
		`Expected ${kw(keyword)}`,
	expectedMethodSplit:
		'Expected a function keyword somewhere.',
	expectedOneLocal:
		'Expected only one local declaration.',
	expectedLocalName: (token: Token): string =>
		`Expected a local name, not ${showToken(token)}.`,
	expectedName: (token: Token): string =>
		`Expected a name, not ${showToken(token)}`,
	extraParens:
		`Unnecessary ${showGroupType(GroupParenthesis)}`,
	funFocusArgIsImplicit: (keyword: Keywords): string =>
		`Nothing may come after ${kw(keyword)}; function argument is implicitly ${kw(Keywords.Focus)}.`,
	implicitFunctionDot:
		`Function ${showChar(Char.Period)} is implicit for methods.`,
	infiniteRange:
		`Use ${kw(Keywords.Dot3)} for infinite ranges.`,
	invalidImportModule:
		'Not a valid module name.',
	methodName:
		`Method name must be exactly one token (may be a ${showGroupType(GroupParenthesis)} group).`,
	noImportFocus:
		`${kw(Keywords.Focus)} not allowed as import name.`,
	noMyOverride:
		`Method can't be both ${kw(Keywords.My)} and ${kw(Keywords.Override)}.`,
	noSpecialKeyword: (kind: Keywords): string =>
		`${kw(kind)} is not allowed here.`,
	nothingAfterFinally:
		`Nothing may come after ${kw(Keywords.Finally)}.`,
	parensOutsideCall:
		`Use ${code('(a b)')}, not ${code('a(b)')}.`,
	reservedWord: (token: Token): string =>
		`Reserved word ${showToken(token)}.`,
	tokenAfterSuper:
		`Expected ${kw(Keywords.Dot)} or ${code('()')} after ${kw(Keywords.Super)}`,
	todoForPattern:
		'TODO: pattern in for',
	todoLazyField:
		'TODO: lazy fields',
	todoMutateDestructure:
		'TODO: LocalDestructureMutate',
	unexpected: (token: Token): string =>
		`Unexpected ${showToken(token)}.`,
	unexpectedAfter: (token: Token): string =>
		`Did not expect anything after ${showToken(token)}.`,
	unexpectedAfterImportDo:
		`This is an ${kw(Keywords.ImportDo)}, so you can't import any values.`,
	unexpectedAfterKind: (kind: Keywords): string =>
		`Did not expect anything between ${kw(kind)} and block.`,
	unexpectedAfterPoly:
		`Did not expect anything between ${kw(Keywords.Poly)} and function.`,

	// Verify:

	ambiguousSK:
		'Can\'t tell if this is a statement. Some parts are statements but others are values.',
	ambiguousForSK:
		`Can't tell if ${kw(Keywords.For)} is a statement. ` +
		`Some ${kw(Keywords.Break)}s have a value, others don't.`,
	argsOperator: (numProvidedArgs: number): string =>
		`Operator should have multiple arguments, got ${numProvidedArgs}`,
	badRegExp: (source: string): string => {
		try {
			/* tslint:disable:no-unused-expression */
			new RegExp(source)
			// This should only be called for bad regexp...
			assert(false)
			return ''
		} catch (err) {
			return err.message
		}
	},
	blockNeedsContent:
		'Value block must have some content.',
	breakCantHaveValue:
		`${kw(Keywords.Break)} with value needs ${kw(Keywords.For)} to be in expression position.`,
	breakNeedsValue:
		`${kw(Keywords.For)} in expression position must ${kw(Keywords.Break)} with a value.`,
	breakValInForBag:
		`${kw(Keywords.Break)} in ${kw(Keywords.ForBag)} may not have value.`,
	cantDetermineName:
		'Expression must be placed in a position where name can be determined.',
	cantInferBlockKind:
		'Block has mixed bag/map/obj entries — can not infer type.',
	destructureAllLazy:
		'All locals of destructuring assignment must all lazy or all non-lazy.',
	doFuncCantHaveType:
		'Function with return type must return something.',
	duplicateImport: (name: string, prevLoc: Loc): string =>
		`${code(name)} already imported at ${showLoc(prevLoc)}`,
	duplicateKey: (key: string): string =>
		`Duplicate key ${code(key)}`,
	duplicateLocal: (name: string): string =>
		`A local ${code(name)} already exists and can't be shadowed.`,
	elseRequiresCatch:
		`${kw(Keywords.Else)} must come after a ${kw(Keywords.Catch)}.`,
	exportName:
		'Module export must have a constant name.',
	forAsyncNeedsAsync:
		`${kw(Keywords.ForAsync)} as statement must be inside an async function.`,
	misplacedAwait:
		`Cannot ${kw(Keywords.Await)} outside of async function.`,
	misplacedBreak:
		'Not in a loop.',
	misplacedSpreadDo:
		`Can not spread here. Did you forget the space after ${kw(Keywords.Dot3)}?`,
	misplacedSpreadVal:
		`Can only spread in call, ${kw(Keywords.New)}, or ${showGroupType(GroupBracket)}.`,
	misplacedYield: (kind: Keywords): string =>
		`Cannot ${kw(kind)} outside of generator function.`,
	missingLocal: (name: string): string =>
		`No such local ${code(name)}.`,
	noLazyCatch:
		'Caught error can not be lazy.',
	noLazyIteratee:
		'Iteration element can not be lazy.',
	overriddenBuiltin: (name: string, builtinPath: string): string =>
		`Local ${code(name)} overrides builtin from ${code(builtinPath)}.`,
	statementAsValue:
		'This can only be used as a statement, but appears in expression context.',
	superForbidden:
		`Class has no superclass, so ${kw(Keywords.Super)} is not allowed.`,
	superMustBeStatement:
		`${kw(Keywords.Super)} in constructor must appear as a statement.'`,
	superNeeded:
		`Constructor must contain ${kw(Keywords.Super)}`,
	superNeedsMethod:
		`${kw(Keywords.Super)} must be in a method.`,
	unusedLocal: (name: string): string =>
		`Unused local variable ${code(name)}.`,
	uselessExcept:
		`${kw(Keywords.Except)} must have ${kw(Keywords.Catch)} or ${kw(Keywords.Finally)}.`,
	valueAsStatement:
		'Value appears in statement context, so it does nothing.'
}
export default english
