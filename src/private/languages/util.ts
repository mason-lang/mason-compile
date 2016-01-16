import Char from 'typescript-char/Char'
import {keywordName, Keywords} from '../token/Keyword'

/** Used when generating messages to highlight a part of that message. */
export function code(str: string): string {
	return `{{${str}}}`
}

export function showChar(char: Char): string {
	return code(String.fromCharCode(char))
}

export function showKeyword(kind: Keywords): string {
	return code(keywordName(kind))
}
