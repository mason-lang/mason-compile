import {Module as EsModule} from 'esast/lib/Program'
import Module from '../ast/Module'
import VerifyResults from '../VerifyResults'
import {setup, tearDown} from './context'
import transpileModule from './transpileModule'

/**
Transform a [[MsAst]] into an esast.

Implementation notes:

[[MsAst]]s map pretty much directly to javascript ASTs, so we just recursively transform the tree.
`transfileFoo` is never allowed to look at the parent.
Occasionally (and it's rare) the parent may pass down some information.
For example, [[transpileBlock]] takes some parameters.

Every `transpileFoo` function must set the location on the output esast.
Otherwise the function should be named `transpileFooNoLoc`.

Some [[MsAst]]s may be either an expression or statement.
In that case, the parent will call either `transpileDo` or `transpileVal`.
That way we have a type safety guarantee that statements only appear in statement context.

There should be no [[CompileError]]s or warnings during transpile.
Any checks should be moved into [[verify]].
That way one gets all errors even if just parsing.
**/
export default function transpile(moduleExpression: Module, verifyRes: VerifyResults): EsModule {
	setup(verifyRes)
	const res = transpileModule(moduleExpression)
	tearDown()
	return res
}
