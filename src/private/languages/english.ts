import Loc from 'esast/lib/Loc'
import {code} from '../../CompileError'
import {Char, showChar} from '../lex/chars'
import Token, {Group, GroupType, Keywords, showKeyword as kw} from '../Token'
import {assert} from '../util'
import Language from './Language'

const english: Language = {
	// Lex:

	badInterpolation:
		`${code('#')} must be followed by ${code('(')}, ${code('#')}, or a name.`,
	badSpacedIndent: (indent: number): string =>
		`Indentation spaces must be a multiple of ${indent}.`,
	emptyBlock:
		'Empty block.',
	extraSpace:
		'Unnecessary space.',
	mismatchedGroupClose: (actual: GroupType, expected: Group<Token>): string =>
		`Trying to close ${actual.prototype.showType()}, but last opened ${expected.showType()}.`,
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
	assignNothing:
		'Assignment to nothing.',
	asToken:
		`Expected only 1 token after ${kw(Keywords.As)}.`,
	caseFocusIsImplicit:
		'Can\'t make focus — is implicitly provided as first argument.',
	caseSwitchNeedsParts:
		`Must have at least 1 non-${kw(Keywords.Else)} test.`,
	destructureAllLazy:
		'All locals of destructuring assignment must all lazy or all non-lazy.',
	expectedAfterAssert:
		`Expected something after ${kw(Keywords.Assert)}.`,
	expectedAfterColon:
		`Expected something after ${kw(Keywords.Colon)}.`,
	expectedBlock:
		'Expected an indented block.',
	expectedExpression:
		'Expected an expression, got nothing.',
	expectedFuncKind: (token: Token): string =>
		`Expected function kind, got ${token}.`,
	expectedImportModuleName:
		'Expected a module name to import.',
	expectedKeyword: (keyword: Keywords): string =>
		`Expected ${kw(keyword)}`,
	expectedMethodSplit:
		'Expected a function keyword somewhere.',
	expectedOneLocal:
		'Expected only one local declaration.',
	expectedLocalName: (token: Token): string =>
		`Expected a local name, not ${token}.`,
	expectedName: (token: Token): string =>
		`Expected a name, not ${token}`,
	extraParens:
		`Unnecessary ${code('()')}`,
	implicitFunctionDot:
		`Function ${showChar(Char.Dot)} is implicit for methods.`,
	infiniteRange:
		`Use ${kw(Keywords.Dot3)} for infinite ranges.`,
	invalidImportModule:
		'Not a valid module name.',
	noImportFocus:
		`${kw(Keywords.Focus)} not allowed as import name.`,
	noSpecialKeyword: (kind: Keywords): string =>
		`${kw(kind)} is not allowed here.`,
	nothingAfterFinally:
		`Nothing may come after ${kw(Keywords.Finally)}.`,
	parensOutsideCall:
		`Use ${code('(a b)')}, not ${code('a(b)')}.`,
	reservedWord: (token: Token): string =>
		`Reserved word ${token}.`,
	switchArgIsImplicit:
		'Value to switch on is `_`, the function\'s implicit argument.',
	tokenAfterSuper:
		`Expected ${kw(Keywords.Dot)} or ${code('()')} after ${kw(Keywords.Super)}`,
	todoForPattern:
		'TODO: pattern in for',
	todoLazyField:
		'TODO: lazy fields',
	todoMutateDestructure:
		'TODO: LocalDestructureMutate',
	unexpected: (token: Token): string =>
		`Unexpected ${token}.`,
	unexpectedAfter: (token: Token): string =>
		`Did not expect anything after ${token}.`,
	unexpectedAfterImportDo:
		`This is an ${kw(Keywords.ImportDo)}, so you can't import any values.`,
	unexpectedAfterKind: (kind: Keywords): string =>
		`Did not expect anything between ${kw(kind)} and block.`,
	unexpectedAfterMethod:
		`Did not expect anything between ${kw(Keywords.Method)} and function.`,

	// Verify:

	ambiguousSK:
		'Can\'t tell if this is a statement. Some parts are statements but others are values.',
	ambiguousForSK:
		`Can't tell if ${kw(Keywords.For)} is a statement. ` +
		`Some ${kw(Keywords.Break)}s have a value, others don't.`,
	argsLogic:
		'Logic expression needs at least 2 arguments.',
	badRegExp: (source: string): string => {
		try {
			/* eslint-disable no-new */
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
	doFuncCantHaveType:
		'Function with return type must return something.',
	duplicateImport: (name: string, prevLoc: Loc): string =>
		`${code(name)} already imported at ${prevLoc}`,
	duplicateKey: (key: string): string =>
		`Duplicate key ${key}`,
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
		`Can only spread in call, ${kw(Keywords.New)}, or ${code('[]')}.`,
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
