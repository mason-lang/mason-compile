// TODO:ES6 Recursive modules should work, so this should not be necessary.

export let parseClass
export let parseExcept
export let parseExpr
export let parseExprParts
export let parseSingle
export let parseSpaced
export let parseSwitch

export function load(_) {
	parseClass = _.parseClass
	parseExcept = _.parseExcept
	parseExpr = _.parseExpr
	parseExprParts = _.parseExprParts
	parseSingle = _.parseSingle
	parseSpaced = _.parseSpaced
	parseSwitch = _.parseSwitch
}
