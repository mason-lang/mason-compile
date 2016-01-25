import Loc from 'esast/lib/Loc'
import {LocalAccess} from '../ast/locals'
import {Pipe} from '../ast/Val'
import {beforeAndBlock} from './parseBlock'
import parseExpr from './parseExpr'
import {Lines, Tokens} from './Slice'

export default function parsePipe(tokens: Tokens): Pipe {
	const [before, block] = beforeAndBlock(tokens)
	return new Pipe(tokens.loc, parseExpr(before), block.mapSlices(parseExpr))
}

export function parsePipeFun(loc: Loc, lines: Lines): Pipe {
	return new Pipe(loc, LocalAccess.focus(loc), lines.mapSlices(parseExpr))
}
