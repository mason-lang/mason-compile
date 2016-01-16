import Quote, {MsRegExp, QuoteTagged, QuoteTemplate, TemplatePart} from '../ast/Quote'
import {fail} from '../context'
import verifyMemberName from './verifyMemberName'
import verifyVal from './verifyVal'

export default function verifyQuote(_: Quote): void {
	if (_ instanceof QuoteTemplate)
		verifyQuoteTemplate(_)
	// Do noting for [[QuoteSimple]].
}

function verifyQuoteTemplate({parts}: QuoteTemplate): void {
	verifyTemplateParts(parts)
}

export function verifyRegExp(_: MsRegExp): void {
	const {loc, parts} = _
	verifyTemplateParts(parts)
	const onlyPart = parts[0]
	// Check RegExp validity; only possible if this has a single part.
	if (parts.length === 1 && typeof onlyPart === 'string')
		try {
			/* tslint:disable:no-unused-expression */
			new RegExp(onlyPart)
		} catch (err) {
			if (!(err instanceof SyntaxError))
				// This should never happen.
				throw err
			throw fail(loc, _ => _.badRegExp(onlyPart))
		}
}

export function verifyQuoteTagged({tag, quote}: QuoteTagged): void {
	verifyVal(tag)
	verifyQuoteTemplate(quote)
}

function verifyTemplateParts(parts: Array<TemplatePart>): void {
	// Turns out TemplatePart = MemberName.
	parts.forEach(verifyMemberName)
}
