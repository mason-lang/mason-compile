import render, {renderWithSourceMap} from 'esast/dist/render'

export default (context, esAst) =>
	context.opts.includeSourceMap() ?
		renderWithSourceMap(esAst, context.opts.modulePath(), `./${context.opts.jsBaseName()}`) :
		render(esAst)
