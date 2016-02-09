import Loc from 'esast/lib/Loc'
import Char from 'typescript-char/Char'
import Token from '../token/Token'
import Group, {GroupBrace, GroupBracket, GroupParenthesis, GroupType} from '../token/Group'
import {Kw} from '../token/Keyword'
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
		`${kw(Kw.Cond)} takes exactly 3 arguments.`,
	argsConditional: (kind: Kw): string =>
		`${kw(kind)} with no block takes exactly 2 arguments.`,
	argsDel:
		`${kw(Kw.Del)} takes only one argument.`,
	argsTraitDo:
		`${kw(Kw.TraitDo)} takes 2 arguments: implementor and trait.`,
	asToken:
		`Expected only 1 token after ${kw(Kw.As)}.`,
	badAssignee:
		`Assignee should be exactly 1 token (may be a ${showGroupType(GroupBrace)} group)`,
	caseSwitchNeedsParts:
		`Must have at least 1 non-${kw(Kw.Else)} test.`,
	expectedAfterAssert:
		`Expected something after ${kw(Kw.Assert)}.`,
	expectedAfterColon:
		`Expected something after ${kw(Kw.Colon)}.`,
	expectedBlock:
		'Expected an indented block.',
	expectedExpression:
		'Expected an expression, got nothing.',
	expectedImportModuleName:
		'Expected a module name to import.',
	expectedKeyword: (keyword: Kw): string =>
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
	funFocusArgIsImplicit: (keyword: Kw): string =>
		`Nothing may come after ${kw(keyword)}; function argument is implicitly ${kw(Kw.Focus)}.`,
	implicitFunctionDot:
		`Function ${showChar(Char.Period)} is implicit for methods.`,
	infiniteRange:
		`Use ${kw(Kw.Dot3)} for infinite ranges.`,
	invalidImportModule:
		'Not a valid module name.',
	methodName:
		`Method name must be exactly one token (may be a ${showGroupType(GroupParenthesis)} group).`,
	noImportFocus:
		`${kw(Kw.Focus)} not allowed as import name.`,
	noMyOverride:
		`Method can't be both ${kw(Kw.My)} and ${kw(Kw.Override)}.`,
	noSpecialKeyword: (kind: 'todo' | 'region'): string =>
		`${code(kind)} is not allowed here.`,
	nothingAfterFinally:
		`Nothing may come after ${kw(Kw.Finally)}.`,
	parensOutsideCall:
		`Use ${code('(a b)')}, not ${code('a(b)')}.`,
	reservedWord: (name: string): string =>
		`Reserved word ${code(name)}.`,
	tokenAfterSuper:
		`Expected ${kw(Kw.Dot)} or ${code('()')} after ${kw(Kw.Super)}`,
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
		`This is an ${kw(Kw.ImportDo)}, so you can't import any values.`,
	unexpectedAfterKind: (kind: Kw): string =>
		`Did not expect anything between ${kw(kind)} and block.`,
	unexpectedAfterPoly:
		`Did not expect anything between ${kw(Kw.Poly)} and function.`,

	// Verify:

	ambiguousSK:
		'Can\'t tell if this is a statement. Some parts are statements but others are values.',
	ambiguousForSK:
		`Can't tell if ${kw(Kw.For)} is a statement. ` +
		`Some ${kw(Kw.Break)}s have a value, others don't.`,
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
		`${kw(Kw.Break)} with value needs ${kw(Kw.For)} to be in expression position.`,
	breakNeedsValue:
		`${kw(Kw.For)} in expression position must ${kw(Kw.Break)} with a value.`,
	breakValInForBag:
		`${kw(Kw.Break)} in ${kw(Kw.ForBag)} may not have value.`,
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
		`${kw(Kw.Else)} must come after a ${kw(Kw.Catch)}.`,
	exportName:
		'Module export must have a constant name.',
	forAsyncNeedsAsync:
		`${kw(Kw.ForAsync)} as statement must be inside an async function.`,
	misplacedAwait:
		`Cannot ${kw(Kw.Await)} outside of async function.`,
	misplacedBreak:
		'Not in a loop.',
	misplacedSpreadDo:
		`Can not spread here. Did you forget the space after ${kw(Kw.Dot3)}?`,
	misplacedSpreadVal:
		`Can only spread in call, ${kw(Kw.New)}, or ${showGroupType(GroupBracket)}.`,
	misplacedYield: (kind: Kw): string =>
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
		`Class has no superclass, so ${kw(Kw.Super)} is not allowed.`,
	superMustBeStatement:
		`${kw(Kw.Super)} in constructor must appear as a statement.'`,
	superNeeded:
		`Constructor must contain ${kw(Kw.Super)}`,
	superNeedsMethod:
		`${kw(Kw.Super)} must be in a method.`,
	unusedLocal: (name: string): string =>
		`Unused local variable ${code(name)}.`,
	uselessExcept:
		`${kw(Kw.Except)} must have ${kw(Kw.Catch)} or ${kw(Kw.Finally)}.`,
	valueAsStatement:
		'Value appears in statement context, so it does nothing.'
}
export default english
