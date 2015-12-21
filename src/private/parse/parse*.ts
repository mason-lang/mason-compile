import Op from 'op/Op'
import {Class, Val, Except, Switch, TraitDo} from '../MsAst'
import Token from '../Token'
import {Lines, Tokens} from './Slice'

// TODO:ES6 Recursive modules should work, so this should not be necessary.

export let opParseExpr: (_: Tokens) => Op<Val>
export let parseClass: (_: Tokens) => Class
export let parseExcept: (_: Tokens) => Except
export let parseExpr: (_: Tokens) => Val
export let parseExprParts: (_: Tokens) => Array<Val>
export let parseNExprParts: (_: Tokens, n: number, errorCode: string) => Array<Val>
export let parseSingle: (_: Token) => Val
export let parseSpaced: (_: Tokens) => Val
export let parseSwitch: (switchedFromFun: boolean, _: Tokens) => Switch
export let parseTraitDo: (_: Tokens) => TraitDo

export function load(_: any) {
	opParseExpr = _.opParseExpr
	parseClass = _.parseClass
	parseExcept = _.parseExcept
	parseExpr = _.parseExpr
	parseExprParts = _.parseExprParts
	parseNExprParts = _.parseNExprParts
	parseSingle = _.parseSingle
	parseSpaced = _.parseSpaced
	parseSwitch = _.parseSwitch
	parseTraitDo = _.parseTraitDo
}
