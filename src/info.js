import {Keywords, keywordName, reservedKeywords as reserved} from './private/Token'

/**
Array of the names of every keyword, not including reserved words.
Alphabetically sorted.
*/
export const keywords =
	Object.keys(Keywords).map(key => keywordName(Keywords[key])).sort()

/**
Array of the names of every reserved word.
Alphabetically sorted.
*/
export const reservedKeywords = reserved.sort()
