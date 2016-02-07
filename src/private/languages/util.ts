import Loc from 'esast/lib/Loc'
import Char from 'typescript-char/Char'
import Group, {GroupBlock, GroupBrace, GroupBracket, GroupParenthesis, GroupQuote, GroupRegExp,
	GroupType} from '../token/Group'
import Keyword, {keywordName, Keywords} from '../token/Keyword'
import Token, {DocComment, NameToken, NumberToken, StringToken} from '../token/Token'

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

export function showGroupType(type: GroupType): string {
	return code((() => {
		switch (type) {
			case GroupBlock:
				return 'indented block'
			case GroupQuote:
				return 'quote'
			case GroupRegExp:
				return '``'
			case GroupParenthesis:
				return '()'
			case GroupBracket:
				return '[]'
			case GroupBrace:
				return '{}'
			default:
				throw new Error(type.name)
		}
	})())
}

export function showGroup(group: Group<Token>): string {
	return showGroupType(group.type)
}

export function showToken(_: Token): string {
	if (_ instanceof Keyword)
		return showKeyword(_.kind)
	else if (_ instanceof Group)
		return showGroup(_)
	else if (_ instanceof DocComment)
		return 'doc comment'
	else if (_ instanceof NameToken)
		return code(_.name)
	else if (_ instanceof NumberToken || _ instanceof StringToken)
		return _.value
	else
		throw new Error(_.constructor.name)
}

export function showLoc(_: Loc): string {
	return code(_.toString())
}
