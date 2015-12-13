// TODO:ES6 Recursive modules should work, so this should not be necessary.

export let opParseExpr
export let parseClass
export let parseExcept
export let parseExpr
export let parseExprParts
export let parseNExprParts
export let parseSingle
export let parseSpaced
export let parseSwitch
export let parseTraitDo

export function load(_) {
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
