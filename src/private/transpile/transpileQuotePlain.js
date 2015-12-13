import {Literal, TemplateElement, TemplateLiteral} from 'esast/dist/ast'
import {isEmpty} from '../util'
import {t0} from './util'

export default function() {
	if (isEmpty(this.parts))
		return LitEmptyString
	else {
		const quasis = [], expressions = []

		// TemplateLiteral must start with a TemplateElement
		if (typeof this.parts[0] !== 'string')
			quasis.push(TemplateElement.empty)

		for (const part of this.parts)
			if (typeof part === 'string')
				quasis.push(TemplateElement.forRawString(part))
			else {
				// "{1}{1}" needs an empty quasi in the middle (and on the ends).
				// There are never more than 2 string parts in a row,
				// so quasis.length === expressions.length or is exactly 1 more.
				if (quasis.length === expressions.length)
					quasis.push(TemplateElement.empty)
				expressions.push(t0(part))
			}

		// TemplateLiteral must end with a TemplateElement, so one more quasi than expression.
		if (quasis.length === expressions.length)
			quasis.push(TemplateElement.empty)

		return new TemplateLiteral(quasis, expressions)
	}
}

const LitEmptyString = new Literal('')
