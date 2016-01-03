import Expression, {LiteralString, TemplateElement, TemplateLiteral} from 'esast/lib/Expression'
import {QuotePlain} from '../ast/Val'
import {isEmpty} from '../util'
import transpileVal from './transpileVal'
import {loc} from './util'

export default function transpileQuotePlain(_: QuotePlain): TemplateLiteral {
	return loc(_, transpileQuotePlainNoLoc(_))
}

export function transpileQuotePlainNoLoc({parts}: QuotePlain): TemplateLiteral {
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
