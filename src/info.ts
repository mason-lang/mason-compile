import {allKeywords} from './private/token/Keyword'
import {reservedWords} from './private/token/keywordNames'

/**
This module is not used by the compiler.
It is exported so that tools can have up-to-date information on the Mason language.
*/

/**
Array of the names of every keyword, not including reserved words.
Alphabetically sorted.
Does not include keywords that aren't names, like `:`.
*/
export const keywords: Array<string> = Array.from(allKeywords).sort()

/**
Array of the names of every reserved word.
Alphabetically sorted.
*/
export const reservedKeywords: Array<string> = Array.from(reservedWords).sort()
