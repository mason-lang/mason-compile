import {Quote} from '../MsAst'
import {parseSingle} from './parse*'

export default tokens =>
	new Quote(tokens.loc, tokens.map(_ => typeof _ === 'string' ? _ : parseSingle(_)))
