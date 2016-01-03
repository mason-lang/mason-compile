import Loc from 'esast/lib/Loc'
import Op from 'op/Op'
import LineContent from './LineContent'
import {LocalDeclare} from './locals'
import MsAst from './MsAst'

/** Whole source file. */
export default class Module extends MsAst {
	constructor(
		loc: Loc,
		/** Not used for compilation, but useful for tools. */
		public name: string,
		public opComment: Op<string>,
		public doImports: Array<ImportDo>,
		public imports: Array<Import>,
		public lines: Array<LineContent>) {
		super(loc)
		if (this.lines === undefined)
			throw new Error("BAAAAH")
		Object.freeze(this)
	}
}

/** Single import in an `import!` block. */
export class ImportDo extends MsAst {
	constructor(loc: Loc, public path: string) {
		super(loc)
	}
}

/**
Single import in an `import` block.
If path is 'global', this is transpiled specially because there's no actual 'global' module.
*/
export class Import extends MsAst {
	constructor(loc: Loc,
		public path: string,
		public imported: Array<LocalDeclare>,
		public opImportDefault: Op<LocalDeclare>) {
		super(loc)
	}
}
