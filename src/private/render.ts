import Node from 'esast/lib/Node'
import esRender, {renderWithSourceMap} from 'esast-render-fast/lib/render'
import {options, pathOptions} from './context'

/** Renders the transpiled Ast. */
export default function render(esAst: Node): {code: string, sourceMap: string} {
	return options.includeSourceMap ?
		renderWithSourceMap(esAst, pathOptions.modulePath, `./${pathOptions.jsBaseName}`) :
		{code: esRender(esAst), sourceMap: ''}
}
