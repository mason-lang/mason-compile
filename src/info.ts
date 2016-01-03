import {allKeywords, keywordName, reservedKeywords as reserved} from './private/token/Keyword'

/**
Array of the names of every keyword, not including reserved words.
Alphabetically sorted.
*/
export const keywords: Array<string> = allKeywords.map(keywordName).sort()

/**
Array of the names of every reserved word.
Alphabetically sorted.
*/
export const reservedKeywords: Array<string> = Array.from(reserved()).map(keywordName).sort()
