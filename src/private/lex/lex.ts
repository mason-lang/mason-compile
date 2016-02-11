import {Pos} from 'esast/lib/Loc'
import {GroupBlock} from '../token/Group'
import {openLine, setupGroupContext, tearDownGroupContext} from './groupContext'
import lexPlain from './lexPlain'
import {pos, setupSourceContext} from './sourceContext'

/**
Lexes the source code into [[Token]]s.
The Mason lexer also groups tokens as part of lexing.
This makes writing a recursive-descent parser easy.
*/
export default function lex(sourceString: string): GroupBlock {
	// Algorithm requires trailing newline to close any blocks.
	if (!sourceString.endsWith('\n'))
		sourceString = `${sourceString}\n`

	/*
	Use a 0-terminated string so that we can use `0` as a switch case in lexPlain.
	This is faster than checking whether index === length.
	(If we check past the end of the string we get `NaN`, which can't be switched on.)
	*/
	sourceString = `${sourceString}\0`

	setupGroupContext()
	setupSourceContext(sourceString)

	openLine(Pos.start)

	lexPlain(false)

	const endPos = pos()
	return tearDownGroupContext(endPos)
}
