import {allKeywords, keywordName, reservedKeywords as reserved} from './private/Token'

/**
Array of the names of every keyword, not including reserved words.
Alphabetically sorted.
*/
export const keywords: Array<string> = allKeywords.map(keywordName).sort()

/**
Array of the names of every reserved word.
Alphabetically sorted.
*/
export const reservedKeywords: Array<string> = reserved.map(keywordName).sort()
