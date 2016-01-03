import Loc from 'esast/lib/Loc'

// todo: Would like `export default abstract class MsAst`
// https://github.com/Microsoft/TypeScript/issues/3792
abstract class MsAst {
	constructor(public loc: Loc) {}
}
export default MsAst
