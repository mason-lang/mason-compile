import Loc from 'esast/lib/Loc'
import Char from 'typescript-char/Char'
import Group, {GroupBlock, GroupBrace, GroupBracket, GroupParenthesis, GroupQuote, GroupSpace,
	GroupRegExp, GroupType} from '../token/Group'
import Keyword, {keywordName, Kw} from '../token/Keyword'
import Token, {DocComment, NameToken, NumberToken, StringToken} from '../token/Token'
import Language from './Language'

/**
Used when generating messages to highlight a part of that message.
These are parsed away by [[ErrorMessage#messageParts]].
Compiler users may choose how to highlight these; with console colors or with highlighted html.
*/
export function code(str: string): string {
	return `{{${str}}}`
}

export function showChar(char: Char): string {
	return code(String.fromCharCode(char))
}

export function showKeyword(kind: Kw): string {
	return code(keywordName(kind))
}

export function showGroupType(type: GroupType, language: Language): string {
	return code((() => {
		switch (type) {
			case GroupBlock:
				return language.indentedBlock
			case GroupQuote:
				return '""'
			case GroupRegExp:
				return '``'
			case GroupParenthesis:
				return '()'
			case GroupBracket:
				return '[]'
			case GroupBrace:
				return '{}'
			case GroupSpace:
				return language.spacedGroup
			default:
				throw new Error(type.name)
		}
	})())
}

export function showGroup(group: Group<Token>, language: Language): string {
	return showGroupType(group.type, language)
}

export function showToken(_: Token, language: Language): string {
	if (_ instanceof Keyword)
		return code(_.name())
	else if (_ instanceof Group)
		return showGroup(_, language)
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
