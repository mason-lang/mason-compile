import './loadLex*'
import {Pos, StartPos} from 'esast/dist/Loc'
import {check} from '../context'
import {openLine, setupGroupContext, tearDownGroupContext} from './groupContext'
import lexPlain from './lexPlain'
import {pos, setupSourceContext} from './sourceContext'

/**
Lexes the source code into {@link Token}s.
The Mason lexer also groups tokens as part of lexing.
This makes writing a recursive-descent parser easy.
See {@link Group}.

@param {string} sourceString
@return {Group<Groups.Block>}
	Block token representing the whole module.
*/
export default function lex(sourceString) {
	// Algorithm requires trailing newline to close any blocks.
	check(sourceString.endsWith('\n'), () => lastCharPos(sourceString),
		'Source code must end in newline.')

	/*
	Use a 0-terminated string so that we can use `0` as a switch case in lexPlain.
	This is faster than checking whether index === length.
	(If we check past the end of the string we get `NaN`, which can't be switched on.)
	*/
	sourceString = `${sourceString}\0`

	setupGroupContext()
	setupSourceContext(sourceString)

	openLine(StartPos)

	lexPlain(false)

	const endPos = pos()
	return tearDownGroupContext(endPos)
}

function lastCharPos(str) {
	const splits = str.split('\n')
	return new Pos(
		splits.length,
		splits[splits.length-1].length)
}