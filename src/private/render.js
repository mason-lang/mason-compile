import render, {renderWithSourceMap} from 'esast/dist/render'
import {options} from './context'

export default esAst =>
	options.includeSourceMap() ?
		renderWithSourceMap(esAst, options.modulePath(), `./${options.jsBaseName()}`) :
		render(esAst)
