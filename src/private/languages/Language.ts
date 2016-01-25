import Loc from 'esast/lib/Loc'
import Char from 'typescript-char/Char'
import Token from '../token/Token'
import Group, {GroupType} from '../token/Group'
import {Keywords} from '../token/Keyword'

interface Language {
	// Lex:

	badInterpolation: string,
	badSpacedIndent(indent: number): string
	emptyBlock: string
	extraSpace: string
	mismatchedGroupClose(actual: GroupType, expected: Group<Token>): string
	noLeadingSpace: string
	nonLeadingTab: string
	noNewlineInInterpolation: string
	reservedChar(char: Char): string
	suggestSimpleQuote(name: string): string
	tooMuchIndent: string
	tooMuchIndentQuote: string
	trailingDocComment: string
	trailingSpace: string
	unclosedQuote: string

	// Parse:

	argsCond: string
	argsConditional(kind: Keywords): string
	argsDel: string
	argsTraitDo: string
	assignNothing: string
	asToken: string
	caseSwitchNeedsParts: string
	destructureAllLazy: string
	expectedAfterAssert: string
	expectedAfterColon: string
	expectedBlock: string
	expectedExpression: string
	expectedImportModuleName: string
	expectedKeyword(keyword: Keywords): string
	expectedMethodSplit: string
	expectedOneLocal: string
	expectedLocalName(token: Token): string
	expectedName(token: Token): string
	extraParens: string
	funFocusArgIsImplicit: (keyword: Keywords) => string
	implicitFunctionDot: string
	infiniteRange: string
	invalidImportModule: string
	noImportFocus: string
	noMyOverride: string
	noSpecialKeyword(kind: Keywords): string
	nothingAfterFinally: string
	parensOutsideCall: string
	reservedWord(token: Token): string
	tokenAfterSuper: string
	todoForPattern: string
	todoLazyField: string
	todoMutateDestructure: string
	unexpected(token: Token): string
	unexpectedAfter(token: Token): string
	unexpectedAfterImportDo: string
	unexpectedAfterKind(kind: Keywords): string
	unexpectedAfterMethod: string

	// Verify:

	ambiguousSK: string
	ambiguousForSK: string
	argsOperator(numProvidedArgs: number): string
	badRegExp(source: string): string
	blockNeedsContent: string
	breakCantHaveValue: string
	breakNeedsValue: string
	breakValInForBag: string
	cantDetermineName: string
	cantInferBlockKind: string
	doFuncCantHaveType: string
	duplicateImport(name: string, prevLoc: Loc): string
	duplicateKey(key: string): string
	duplicateLocal(name: string): string
	elseRequiresCatch: string
	exportName: string
	forAsyncNeedsAsync: string
	misplacedAwait: string
	misplacedBreak: string
	misplacedSpreadDo: string
	misplacedSpreadVal: string
	misplacedYield(kind: Keywords): string
	missingLocal(name: string): string
	noLazyCatch: string
	noLazyIteratee: string
	overriddenBuiltin(name: string, builtinPath: string): string
	statementAsValue: string
	superForbidden: string
	superMustBeStatement: string
	superNeeded: string
	superNeedsMethod: string
	unusedLocal(name: string): string
	uselessExcept: string
	valueAsStatement: string
}
export default Language
