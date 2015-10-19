import esRender, {renderWithSourceMap} from 'esast/dist/render'
import {options} from './context'

/** Renders the transpiled Ast. */
export default function render(esAst) {
	return options.includeSourceMap() ?
		renderWithSourceMap(esAst, options.modulePath(), `./${options.jsBaseName()}`) :
		esRender(esAst)
}
