import { BlockWithReturn, CaseDo, CaseDoPart, CaseVal, CaseValPart, ConditionalDo, ConditionalVal,
	Fun, Pattern, SwitchDo, SwitchDoPart, SwitchVal, SwitchValPart } from '../../dist/private/MsAst'
import { aAccess, assignAZero, assignFocusZero, bDeclare, bAccess, blockDbg, blockOne, blockTwo,
	blockPass, focusAccess, focusDeclare, loc, one, zero } from './util/ast-util'
import { test } from './util/test-asts'

describe('conditionals', () => {
	test(
		`
			if! 0
				debugger!`,
		new ConditionalDo(loc, zero, blockDbg, false),
		`
			if(0){
				debugger
			}`)
	test(
		`
			unless! 0
				debugger!`,
		new ConditionalDo(loc, zero, blockDbg, true),
		`
			if(! 0){
				debugger
			}`
		)
	test(
		`
			if 0
				1`,
		new ConditionalVal(loc, zero, blockOne, false),
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
		new CaseDo(loc, null, [ new CaseDoPart(loc, zero, blockDbg) ], null),
		`
			if(0){
				debugger
			} else throw new (Error)("No branch of \`case\` matches.")`)
	test(
		`
			case! 0
				_
					pass`,
		new CaseDo(loc,
			assignFocusZero,
			[ new CaseDoPart(loc, focusAccess, blockPass) ],
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
		new CaseDo(loc, null,
			[ new CaseDoPart(loc, zero, blockDbg) ],
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
		new CaseVal(loc, null,
			[ new CaseValPart(loc, zero, blockOne) ],
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
			new CaseVal(loc, assignFocusZero,
				[
					new CaseValPart(loc,
						new Pattern(loc, aAccess, [ bDeclare ], focusAccess),
						new BlockWithReturn(loc, [ ], bAccess))
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
		new Fun(
			loc,
			null,
			false,
			[ focusDeclare ],
			null,
			new BlockWithReturn(loc, [ ],
				new CaseVal(loc, null,
					[
						new CaseValPart(loc, focusAccess, blockOne)
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
		new SwitchDo(loc, zero,
			[ new SwitchDoPart(loc, one, blockPass) ],
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
		new SwitchVal(loc, zero,
			[ new SwitchValPart(loc, one, new BlockWithReturn(loc, [ assignAZero ], aAccess)) ],
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
