import {code} from '../../CompileError'
import {LD_Const, LD_Lazy, LocalDeclare} from '../MsAst'
import {DotName, G_Space, isGroup, isKeyword, KW_Focus, KW_Lazy, KW_Type, Name} from '../Token'
import {opIf} from '../util'
import {checkNonEmpty, context} from './context'
import {parseSpaced} from './parse*'
import Slice from './Slice'

export default (tokens, includeMemberArgs) =>
	includeMemberArgs ? parseLocalDeclaresAndMemberArgs(tokens) : tokens.map(parseLocalDeclare)

export const
	parseLocalDeclaresJustNames = tokens =>
		tokens.map(_ => LocalDeclare.plain(_.loc, parseLocalName(_))),

	// _orMember: if true, will look for `.x` arguments and return {declare, isMember}.
	parseLocalDeclare = (token, _orMember) => {
		let isMember = false
		let declare

		const parseLocalNameOrMember = token => {
			if (_orMember) {
				isMember = token instanceof DotName && token.nDots === 1
				return isMember ? token.name : parseLocalName(token)
			} else
				return parseLocalName(token)
		}

		if (isGroup(G_Space, token)) {
			const tokens = Slice.group(token)
			const [rest, isLazy] =
				isKeyword(KW_Lazy, tokens.head()) ? [tokens.tail(), true] : [tokens, false]

			const name = parseLocalNameOrMember(rest.head())
			const rest2 = rest.tail()
			const opType = opIf(!rest2.isEmpty(), () => {
				const colon = rest2.head()
				context.check(isKeyword(KW_Type, colon), colon.loc, () => `Expected ${code(':')}`)
				const tokensType = rest2.tail()
				checkNonEmpty(tokensType, () => `Expected something after ${colon}`)
				return parseSpaced(tokensType)
			})
			declare = new LocalDeclare(token.loc, name, opType, isLazy ? LD_Lazy : LD_Const)
		} else
			declare = LocalDeclare.plain(token.loc, parseLocalNameOrMember(token))

		if (_orMember)
			return {declare, isMember}
		else
			return declare
	},

	parseLocalDeclaresAndMemberArgs = tokens => {
		const declares = [], memberArgs = []
		for (const token of tokens) {
			const {declare, isMember} = parseLocalDeclare(token, true)
			declares.push(declare)
			if (isMember)
				memberArgs.push(declare)
		}
		return {declares, memberArgs}
	},

	parseLocalName = token => {
		if (isKeyword(KW_Focus, token))
			return '_'
		else {
			context.check(token instanceof Name, token.loc, () =>
				`Expected a local name, not ${token}.`)
			return token.name
		}
	}