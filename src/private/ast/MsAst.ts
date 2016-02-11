import Loc from 'esast/lib/Loc'

/**
Base class of all Mason ASTs.
A tree of these is the output of [[parse]].

Most MsAsts are [[LineContent]]s.
MsAsts never know about their parents.

MsAsts are immutable, but extra information is added to [[VerifyResults]].

All Asts must have handlers in [[verify]] and [[transpile]].
There are no "verify" or "transpile" abstract methods to preserve modularity.
This hurts efficiency a bit as verify and transpile use `instanceof` instead of object dispatch.
In future it would be nice to use partial classes to get both modularity and fast dispatch.
See <https://github.com/Microsoft/TypeScript/issues/563>.
*/
abstract class MsAst {
	constructor(
		/**
		This is simply taken from the tokens that made up this AST.
		[[Slice]] handles loc tracking for groups of tokens.
		This is then used for errors/warnings about this AST and for is passed to transpile output.
		*/
		public loc: Loc) {}
}
// todo: Would like `export default abstract class MsAst`
// https://github.com/Microsoft/TypeScript/issues/3792
export default MsAst
