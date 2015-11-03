// TODO:ES6 Recursive modules should work, so this should not be necessary.

import parseClass from './parseClass'
import parseExcept from './parseExcept'
import parseExpr, {opParseExpr, parseExprParts} from './parseExpr'
import parseSingle from './parseSingle'
import parseSpaced from './parseSpaced'
import parseSwitch from './parseSwitch'
import {load} from './parse*'

load({
	opParseExpr,
	parseClass, parseExcept, parseExpr, parseExprParts, parseSingle, parseSpaced, parseSwitch
})
