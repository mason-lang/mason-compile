import Block from '../../lib/private/ast/Block'
import {Conditional} from '../../lib/private/ast/booleans'
import Case, {CasePart, Pattern} from '../../lib/private/ast/Case'
import {FunBlock} from '../../lib/private/ast/Fun'
import Switch, {SwitchPart} from '../../lib/private/ast/Switch'
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
			if 0
				1`,
		new Conditional(loc, zero, blockOne, false),
		`
			(0?_ms.some((()=>{
				return 1
			})()):_ms.None)`)
	test(
		`if 0 1`,
		new Conditional(loc, zero, one, false),
		`(0?_ms.some(1):_ms.None)`)
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
		new Case(
			loc,
			assignFocusZero,
			[new CasePart(loc, focusAccess, blockPass)],
			null),
		`
			{
				let _=0;
				if(_){} else throw new (Error)("No branch of \`case\` matches.")
			}`)
	test(
		`
			case
				0
					debugger
				else
					pass`,
		new Case(
			loc,
			null,
			[new CasePart(loc, zero, blockDbg)],
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
		new Case(
			loc,
			null,
			[new CasePart(loc, zero, blockOne)],
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
			case 0
				:1 b
					b
				else
					2`,
		new Case(
			loc,
			assignFocusZero,
			[new CasePart(
				loc,
				new Pattern(loc, one, [bDeclare]),
				new Block(loc, null, [bAccess]))],
			blockTwo),
		`
			(()=>{
				let _=0;
				{
					let _$=_ms.extract(1,_,1);
					if((_$!==null)){
						let b=_$[0];
						return b
					} else {
						return 2
					}
				}
			})()`)
	test(
		`
			\\case
				_
					1`,
		new FunBlock(
			loc,
			[focusDeclare],
			null,
			new Block(
				loc,
				null,
				[new Case(
					loc,
					null,
					[new CasePart(loc, focusAccess, blockOne)],
					null)])),
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
			!\\case
				_
					pass`,
		new FunBlock(
			loc,
			[focusDeclare],
			null,
			new Block(
				loc,
				null,
				[new Case(
					loc,
					null,
					[new CasePart(loc, focusAccess, blockPass)],
					null)]),
			{isDo: true}),
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
		new Switch(
			loc,
			zero,
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
			switch 0
				1
					a = 0
					a
				else
					1`,
		new Switch(
			loc,
			zero,
			[new SwitchPart(
				loc,
				[one],
				new Block(loc, null, [assignAZero, aAccess]))],
			blockOne),
		`
			(()=>{
				switch(0){
					case 1:{
						let a=0;
						return a
					}
					default:return 1
				}
			})()`)
	test(
		`
			switch 0
				0 1
					pass`,
		new Switch(
			loc,
			zero,
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
			\\switch
				0
					1`,
		new FunBlock(
			loc,
			[focusDeclare],
			null,
			new Block(loc, null, [
				new Switch(
					loc,
					focusAccess,
					[new SwitchPart(loc, [zero], blockOne)],
					null)])),
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
			!\\switch
				0
					pass`,
		new FunBlock(
			loc,
			[focusDeclare],
			null,
			new Block(loc, null, [
				new Switch(
					loc,
					focusAccess,
					[new SwitchPart(loc, [zero], blockPass)],
					null)]),
			{isDo: true}),
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
