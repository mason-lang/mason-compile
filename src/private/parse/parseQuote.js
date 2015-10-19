import {Quote} from '../MsAst'
import {parseSingle} from './parse*'

/** Parse tokens in a {@link Groups.Quote}. */
export default function parseQuote(tokens) {
	return new Quote(tokens.loc, tokens.map(_ => typeof _ === 'string' ? _ : parseSingle(_)))
}
