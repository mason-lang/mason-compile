import {allKeywords} from './private/token/Keyword'
import {reservedWords} from './private/token/keywordNames'

/**
Array of the names of every keyword, not including reserved words.
Alphabetically sorted.
*/
export const keywords: Array<string> = Array.from(allKeywords).sort()

/**
Array of the names of every reserved word.
Alphabetically sorted.
*/
export const reservedKeywords: Array<string> = Array.from(reservedWords).sort()
