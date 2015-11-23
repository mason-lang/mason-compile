import esRender, {renderWithSourceMap} from 'esast/dist/render'
import {options, pathOptions} from './context'

/** Renders the transpiled Ast. */
export default function render(esAst) {
	return options.includeSourceMap() ?
		renderWithSourceMap(esAst, pathOptions.modulePath(), `./${pathOptions.jsBaseName()}`) :
		esRender(esAst)
}
