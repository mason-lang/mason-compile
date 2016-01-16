import Expression, {ArrayExpression} from 'esast/lib/Expression'
import {LiteralRegExp, LiteralString} from 'esast/lib/Literal'
import TemplateLiteral, {TaggedTemplateExpression, TemplateElement} from 'esast/lib/TemplateLiteral'
import Quote, {MsRegExp, QuoteTemplate, QuoteSimple, QuoteTagged} from '../ast/Quote'
import {isEmpty} from '../util'
import {msCall} from './ms'
import transpileMemberName from './transpileMemberName'
import transpileVal from './transpileVal'
import {loc} from './util'

export default function transpileQuote(_: Quote): Expression {
	return loc(_, transpileQuoteNoLoc(_))
}

export function transpileQuoteNoLoc(_: Quote): Expression {
	if (_ instanceof QuoteTemplate)
		return transpileQuoteTemplateNoLoc(_)
	else if (_ instanceof QuoteSimple)
		return new LiteralString(_.value)
	else
		throw new Error()
}

function transpileQuoteTemplate(_: QuoteTemplate): TemplateLiteral {
	return loc(_, transpileQuoteTemplateNoLoc(_))
}

function transpileQuoteTemplateNoLoc({parts}: QuoteTemplate): TemplateLiteral {
	if (isEmpty(parts))
		return new TemplateLiteral([TemplateElement.empty], [])
	else {
		const quasis: Array<TemplateElement> = []
		const expressions: Array<Expression> = []

		// TemplateLiteral must start with a TemplateElement
		if (typeof parts[0] !== 'string')
			quasis.push(TemplateElement.empty)

		for (const part of parts)
			if (typeof part === 'string')
				quasis.push(TemplateElement.forRawString(part))
			else {
				// "{1}{1}" needs an empty quasi in the middle (and on the ends).
				// There are never more than 2 string parts in a row,
				// so quasis.length === expressions.length or is exactly 1 more.
				if (quasis.length === expressions.length)
					quasis.push(TemplateElement.empty)
				expressions.push(transpileVal(part))
			}

		// TemplateLiteral must end with a TemplateElement, so one more quasi than expression.
		if (quasis.length === expressions.length)
			quasis.push(TemplateElement.empty)

		return new TemplateLiteral(quasis, expressions)
	}
}

export function transpileQuoteTaggedNoLoc({tag, quote}: QuoteTagged): TaggedTemplateExpression {
	return new TaggedTemplateExpression(transpileVal(tag), transpileQuoteTemplate(quote))
}

export function transpileRegExpNoLoc(_: MsRegExp): Expression {
	const {parts, flags} = _
	if (parts.length === 0)
		return new LiteralRegExp(new RegExp('', flags))
	else {
		const firstPart = parts[0]
		return parts.length === 1 && typeof firstPart === 'string' ?
			new LiteralRegExp(new RegExp(firstPart.replace(/\n/g, '\\n'), flags)) :
			msCall(
				'regexp',
				new ArrayExpression(parts.map(transpileTemplatePart)),
				new LiteralString(flags))
	}
}

// Turns out TemplatePart = MemberName.
const transpileTemplatePart = transpileMemberName
