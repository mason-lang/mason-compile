import Loc from 'esast/lib/Loc'
import Char from 'typescript-char/Char'
import Token from '../token/Token'
import Group, {GroupType} from '../token/Group'
import {Kw} from '../token/Keyword'

/** The language used for warning and error messages. */
interface Language {
	// Helpers

	indentedBlock: string,
	spacedGroup: string,

	// Lex

	badInterpolation: string,
	badSpacedIndent(indent: number): string
	commentNeedsSpace: string
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

	// Parse

	argsCond: string
	argsConditional(kind: Kw): string
	argsDel: string
	argsTraitDo: string
	asToken: string
	badAssignee: string
	caseSwitchNeedsParts: string
	expectedAfterAssert: string
	expectedAfterColon: string
	expectedBlock: string
	expectedExpression: string
	expectedImportModuleName: string
	expectedKeyword(keyword: Kw): string
	expectedMethodSplit: string
	expectedOneLocal: string
	expectedLocalName(token: Token): string
	expectedName(token: Token): string
	extraParens: string
	funFocusArgIsImplicit: (keyword: Kw) => string
	implicitFunctionDot: string
	infiniteRange: string
	invalidImportModule: string
	methodName: string
	noImportFocus: string
	noMyOverride: string
	noSpecialKeyword(kind: 'todo' | 'region'): string
	nothingAfterFinally: string
	parensOutsideCall: string
	reservedWord(name: string): string
	tokenAfterSuper: string
	todoForPattern: string
	todoLazyField: string
	todoMutateDestructure: string
	unexpected(token: Token): string
	unexpectedAfter(token: Token): string
	unexpectedAfterImportDo: string
	unexpectedAfterKind(kind: Kw): string
	unexpectedAfterPoly: string

	// Verify

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
	destructureAllLazy: string
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
	misplacedYield(kind: Kw): string
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
