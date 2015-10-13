import {code} from '../../CompileError'
import {LD_Const, LD_Lazy, LocalDeclare} from '../MsAst'
import {G_Space, isGroup, isKeyword, KW_Dot, KW_Focus, KW_Lazy, KW_Type, Name} from '../Token'
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
	// TODO:ES6 _orMember=false
	parseLocalDeclare = (token, _orMember) => {
		if (isGroup(G_Space, token))
			return parseLocalDeclareFromSpaced(Slice.group(token), _orMember)
		else {
			const declare = LocalDeclare.plain(token.loc, parseLocalName(token))
			return _orMember ? {declare, isMember: false} : declare
		}
	},

	// TODO:ES6 _orMember=false
	parseLocalDeclareFromSpaced = (tokens, _orMember) => {
		const [rest, isLazy, isMember] =
			isKeyword(KW_Lazy, tokens.head()) ?
				[tokens.tail(), true, false] :
				_orMember && isKeyword(KW_Dot, tokens.head()) ?
				[tokens.tail(), false, true] :
				[tokens, false, false]
		const name = parseLocalName(rest.head())
		const rest2 = rest.tail()
		const opType = opIf(!rest2.isEmpty(), () => {
			const colon = rest2.head()
			context.check(isKeyword(KW_Type, colon), colon.loc, () => `Expected ${code(':')}`)
			const tokensType = rest2.tail()
			checkNonEmpty(tokensType, () => `Expected something after ${colon}`)
			return parseSpaced(tokensType)
		})
		const declare =  new LocalDeclare(tokens.loc, name, opType, isLazy ? LD_Lazy : LD_Const)
		return _orMember ? {declare, isMember} : declare
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