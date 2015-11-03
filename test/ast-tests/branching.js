import {BlockDo, BlockValReturn, Case, CasePart, Conditional, Fun, Pattern, Switch, SwitchPart,
	Throw} from '../../dist/private/MsAst'
import {aAccess, assignAZero, assignFocusZero, bDeclare, bAccess, blockDbg, blockOne, blockTwo,
	blockPass, focusAccess, focusDeclare, loc, one, zero} from './util/ast-util'
import {test} from './util/test-asts'

describe('conditionals', () => {
	test(
		`
			if 0
				debugger`,
		new Conditional(loc, zero, blockDbg, false),
		`
			if(0){
				debugger
			}`)
	test(
		`
			unless 0
				debugger`,
		new Conditional(loc, zero, blockDbg, true),
		`
			if(! 0){
				debugger
			}`
		)
	test(
		`
			throw if 0
				1`,
		new Throw(loc, new Conditional(loc, zero, blockOne, false)),
		`
			throw (0?_ms.some((()=>{
				return 1
			})()):_ms.None)`)
})

describe('case', () => {
	test(
		`
			case
				0
					debugger`,
		new Case(loc, null, [new CasePart(loc, zero, blockDbg)], null),
		`
			if(0){
				debugger
			} else throw new (Error)("No branch of \`case\` matches.")`)
	test(
		`
			case 0
				_
					pass`,
		new Case(loc,
			assignFocusZero,
			[new CasePart(loc, focusAccess, blockPass)],
			null),
		`
			{
				const _=0;
				if(_){} else throw new (Error)("No branch of \`case\` matches.")
			}`)
	test(
		`
			case
				0
					debugger
				else
					pass`,
		new Case(loc, null,
			[new CasePart(loc, zero, blockDbg)],
			blockPass),
		`
			if(0){
				debugger
			} else {}`
		)
	test(
		`
			throw case
				0
					1
				else
					2`,
		new Throw(loc,
			new Case(loc, null,
				[new CasePart(loc, zero, blockOne)],
				blockTwo)),
		`
			throw (()=>{
				if(0){
					return 1
				} else {
					return 2
				}
			})()`)
	test(
		`
			a = 0
			throw case 0
				:a b
					b
				else
					1`,
		[
			assignAZero,
			new Throw(loc,
				new Case(loc, assignFocusZero,
					[
						new CasePart(loc,
							new Pattern(loc, aAccess, [bDeclare]),
							new BlockValReturn(loc, null, [], bAccess))
					],
					blockOne))
		],
		`
			const a=0;
			throw (()=>{
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
			[focusDeclare],
			null,
			new BlockValReturn(loc, null, [],
				new Case(loc, null,
					[new CasePart(loc, focusAccess, blockOne)],
					null))),
		`
			_=>{
				return (()=>{
					if(_){
						return 1
					} else throw new (Error)("No branch of \`case\` matches.")
				})()
			}`)
	test(
		`
			!|case
				_
					pass`,
		new Fun(
			loc,
			[focusDeclare],
			null,
			new BlockDo(loc, null, [
				new Case(loc, null,
					[new CasePart(loc, focusAccess, blockPass)],
					null)])),
		`
			_=>{
				if(_){} else throw new (Error)("No branch of \`case\` matches.")
			}`)
})

describe('switch', () => {
	test(
		`
			switch 0
				1
					pass`,
		new Switch(loc, zero,
			[new SwitchPart(loc, [one], blockPass)],
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
			throw switch 0
				1
					a = 0
					a
				else
					1`,
		new Throw(loc,
			new Switch(loc, zero,
				[new SwitchPart(loc,
					[one],
					new BlockValReturn(loc, null, [assignAZero], aAccess))],
				blockOne)),
		`
			throw (()=>{
				switch(0){
					case 1:{
						const a=0;
						return a
					}
					default:return 1
				}
			})()`)
	test(
		`
			switch 0
				or 0 1
					pass`,
		new Switch(loc, zero,
			[new SwitchPart(loc, [zero, one], blockPass)],
			null),
		`
			switch(0){
				case 0:
				case 1:{
					break
				}
				default:throw new (Error)("No branch of \`switch\` matches.")
			}`)
	test(
		`
			|switch
				0
					1`,
		new Fun(
			loc,
			[focusDeclare],
			null,
			new BlockValReturn(loc, null, [],
				new Switch(loc, focusAccess,
					[new SwitchPart(loc, [zero], blockOne)],
					null))),
		`
			_=>{
				return (()=>{
					switch(_){
						case 0:{
							return 1
						}
						default:throw new (Error)("No branch of \`switch\` matches.")
					}
				})()
			}`)
	test(
		`
			!|switch
				0
					pass`,
		new Fun(
			loc,
			[focusDeclare],
			null,
			new BlockDo(loc, null, [
				new Switch(loc, focusAccess,
					[new SwitchPart(loc, [zero], blockPass)],
					null)])),
		`
			_=>{
				switch(_){
					case 0:{
						break
					}
					default:throw new (Error)("No branch of \`switch\` matches.")
				}
			}`)
})
