import { singleCharLoc, StartPos } from 'esast/dist/Loc'
import render from 'esast/dist/render'
import fs from 'q-io/fs'
import { relative } from 'path'
import { BagSimple, Module, Quote } from '../MsAst'
import CompileContext from '../private/CompileContext'
import CompileOptions from '../private/CompileOptions'
import transpile from '../private/transpile/transpile'
import { flatOpMap, opIf } from '../private/util'
import VerifyResults from '../private/VerifyResults'

// Searches a directory and creates a module whose default export is
// a list of the paths of every module in that directory, relative to it.
export default (dirPath, opts) =>
	fs.listTree(dirPath).then(files => {
		const moduleFiles = flatOpMap(files, _ =>
			opIf(acceptModule(opts, _), () =>
				`./${relative(dirPath, _.slice(0, _.length - ext.length))}`))
		// Sort to keep it deterministic.
		moduleFiles.sort()
		// Dummy Loc. We will not use source maps.
		const loc = singleCharLoc(StartPos)
		// Sort to keep it deterministic.
		const modulesBag = BagSimple(loc, moduleFiles.map(_ => Quote.forString(loc, _)))
		const module = Module(loc, [ ], [ ], [ ], [ ], [ ], modulesBag)
		return render(transpile(new CompileContext(options), module, new VerifyResults()))
	})

const ext = '.js'
const acceptModule = (opts, path) =>
	path.endsWith(ext) && !(opts.exclude && opts.exclude.test(path))
const options = new CompileOptions({
	includeSourceMap: false,
	includeModuleName: false
})
