import { BlockWithReturn, CaseDo, CaseDoPart, CaseVal, CaseValPart, ConditionalDo, ConditionalVal,
	Fun, Pattern, SwitchDo, SwitchDoPart, SwitchVal, SwitchValPart } from '../../dist/MsAst'
import { aAccess, assignAZero, assignFocusZero, bDeclare, bAccess, blockDbg, blockOne, blockTwo,
	blockPass, focusAccess, focusDeclare, loc, one, zero } from './util/ast-util'
import { test } from './util/test-asts'

describe('conditionals', () => {
	test(
		`
			if! 0
				debugger!`,
		ConditionalDo(loc, zero, blockDbg, false),
		`
			if(0){
				debugger
			}`)
	test(
		`
			unless! 0
				debugger!`,
		ConditionalDo(loc, zero, blockDbg, true),
		`
			if(! 0){
				debugger
			}`
		)
	test(
		`
			if 0
				1`,
		ConditionalVal(loc, zero, blockOne, false),
		`
			0?_ms.some((()=>{
				return 1
			})()):_ms.None`)
})

describe('case', () => {
	test(
		`
			case!
				0
					debugger!`,
		CaseDo(loc, null, [ CaseDoPart(loc, zero, blockDbg) ], null),
		`
			if(0){
				debugger
			} else throw new (Error)("No branch of \`case\` matches.")`)
	test(
		`
			case! 0
				_
					pass`,
		CaseDo(loc,
			assignFocusZero,
			[ CaseDoPart(loc, focusAccess, blockPass) ],
			null),
		`
			{
				const _=0;
				if(_){} else throw new (Error)("No branch of \`case\` matches.")
			}`)
	test(
		`
			case!
				0
					debugger!
				else
					pass`,
		CaseDo(loc, null,
			[ CaseDoPart(loc, zero, blockDbg) ],
			blockPass),
		`
			if(0){
				debugger
			} else {}`
		)
	test(
		`
			case
				0
					1
				else
					2`,
		CaseVal(loc, null,
			[ CaseValPart(loc, zero, blockOne) ],
			blockTwo),
		`
			(()=>{
				if(0){
					return 1
				} else {
					return 2
				}
			})()`)
	test(
		`
			a = 0
			case 0
				:a b
					b
				else
					1`,
		[
			assignAZero,
			CaseVal(loc, assignFocusZero,
				[
					CaseValPart(loc,
						Pattern(loc, aAccess, [ bDeclare ], focusAccess),
						BlockWithReturn(loc, [ ], bAccess))
				],
				blockOne)
		],
		`
			const a=0;
			return (()=>{
				const _=0;
				{
					const _$=_ms.extract(a,_);
					if((_$!==null)){
						const b=_$[0];
						return b
					} else {
						return 1
					}
				}
			})()`)
	test(
		`
			|case
				_
					1`,
		Fun(
			loc,
			null,
			false,
			[ focusDeclare ],
			null,
			BlockWithReturn(loc, [ ],
				CaseVal(loc, null,
					[
						CaseValPart(loc, focusAccess, blockOne)
					]))),
		`
			_=>{
				return (()=>{
					if(_){
						return 1
					} else throw new (Error)("No branch of \`case\` matches.")
				})()
			}`)
})

describe('switch', () => {
	test(
		`
			switch! 0
				1
					pass`,
		SwitchDo(loc, zero,
			[ SwitchDoPart(loc, one, blockPass) ],
			null),
		`
			switch(0){
				case 1:{
					break
				}
				default:throw new (Error)("No branch of \`switch\` matches.")
			}`)
	test(
		`
			switch 0
				1
					a = 0
					a
				else
					1`,
		SwitchVal(loc, zero,
			[ SwitchValPart(loc, one, BlockWithReturn(loc, [ assignAZero ], aAccess)) ],
			blockOne),
		`
			(()=>{
				switch(0){
					case 1:{
						const a=0;
						return a
					}
					default:return 1
				}
			})()`)
})
