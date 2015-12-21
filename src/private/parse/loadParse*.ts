// TODO:ES6 Recursive modules should work, so this should not be necessary.

import parseClass from './parseClass'
import parseExcept from './parseExcept'
import parseExpr, {opParseExpr, parseExprParts, parseNExprParts} from './parseExpr'
import parseSingle from './parseSingle'
import parseSpaced from './parseSpaced'
import parseSwitch from './parseSwitch'
import parseTraitDo from './parseTraitDo'
import {load} from './parse*'

load({
	opParseExpr, parseClass, parseExcept, parseExpr, parseExprParts, parseNExprParts, parseSingle,
	parseSpaced, parseSwitch, parseTraitDo
})
