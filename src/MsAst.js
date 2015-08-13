import Loc from 'esast/dist/Loc'
import tupl, { abstract } from 'tupl/dist/tupl'
import { Nullable, Union } from 'tupl/dist/type'
import { JsGlobals } from './private/language'

const MsAst = abstract('MsAst', Object, 'doc')
export default MsAst

export const
	LineContent = abstract('ValOrDo', MsAst, 'Valid part of a Block.'),
	Do = abstract('Do', LineContent, `
		These can only appear as lines in a Block.
		Not to be confused with Generator expressions resulting from \`do\` keyword.`),
	Val = abstract('Val', LineContent, 'These can appear in any expression.')

const makeType = superType => (name, doc, namesTypes, protoProps, tuplProps) =>
	tupl(name, superType, doc, [ 'loc', Loc ].concat(namesTypes), protoProps, tuplProps)

const
	m = makeType(MsAst), d = makeType(Do), v = makeType(Val)

export const
	LD_Const = 0,
	LD_Lazy = 1,
	LD_Mutable = 2,
	LocalDeclare = m('LocalDeclare',
		'TODO:DOC',
		[
			'name', String,
			'opType', Nullable(Val),
			'kind', Number
		],
		{
			isLazy() { return this.kind === LD_Lazy },
			isMutable() { return this.kind === LD_Mutable }
		},
		{
			untyped(loc, name, kind) {
				return LocalDeclare(loc, name, null, kind)
			},
			plain(loc, name) {
				return LocalDeclare(loc, name, null, LD_Const)
			}
		})

const localDeclarePlainType = name =>
	makeType(LocalDeclare)(`LocalDeclare_${name}`,
		'TODO:DOC',
		[ ],
		{ opType: null, kind: LD_Const, name })

export const
	LocalDeclareBuilt = localDeclarePlainType('built'),
	LocalDeclareFocus = localDeclarePlainType('_'),
	LocalDeclareName = localDeclarePlainType('name'),
	LocalDeclareThis = localDeclarePlainType('this'),
	LocalDeclareRes = makeType(LocalDeclare)('LocalDeclareRes',
		'TODO:DOC',
		[ 'opType', Nullable(Val) ],
		{
			name: 'res',
			kind: LD_Const
		}),

	// All have .allAssignees()
	Assign = abstract('Assign', Do, 'TODO:DOC'),
	AssignSingle = makeType(Assign)('AssignSingle',
		'TODO:DOC',
		[
			'assignee', LocalDeclare,
			'value', Val
		],
		{
			allAssignees() { return [ this.assignee ] }
		},
		{
			focus: (loc, value) =>
				AssignSingle(loc, LocalDeclareFocus(loc), value)
		}),
	AssignDestructure = makeType(Assign)('AssignDestructure',
		'TODO:DOC',
		[
			'assignees', [LocalDeclare],
			'value', Val
		],
		{
			allAssignees() { return this.assignees },
			// All assignees must share the same kind.
			kind() { return this.assignees[0].kind }
		}),

	Throw = d('Throw',
		'TODO:DOC',
		[ 'opThrown', Nullable(Val) ]),

	Debug = d('Debug',
		'TODO:DOC',
		[ 'lines', [LineContent] ]),

	Block = abstract('Block', MsAst, 'TODO:DOC'),
	BlockDo = makeType(Block)('BlockDo',
		'TODO:DOC',
		[ 'lines', [LineContent] ]),
	BlockVal = abstract('BlockVal', Block, 'TODO:DOC'),
	BlockWithReturn = makeType(BlockVal)('BlockWithReturn',
		'TODO:DOC',
		[ 'lines', [LineContent], 'returned', Val ]),
	BlockValThrow = makeType(BlockVal)('BlockValThrow',
		'TODO:DOC',
		[ 'lines', [LineContent], '_throw', Throw ]),

	ObjEntry = d('ObjEntry',
		'TODO:DOC',
		[ 'assign', Assign ]),

	// TODO: BlockBag, BlockMap, BlockObj => BlockBuild(kind, ...)
	BlockObj = makeType(BlockVal)('BlockObj',
		'TODO:DOC',
		[
			'built', LocalDeclareBuilt,
			'lines', [LineContent],
			'opObjed', Nullable(Val),
			'opName', Nullable(String)
		],
		{ },
		{
			of: (loc, lines, opObjed, opName) =>
				BlockObj(loc, LocalDeclareBuilt(loc), lines, opObjed, opName)
		}),

	BagEntry = d('BagEntry',
		'TODO:DOC',
		[ 'value', Val ]),
	BagEntryMany = d('BagEntryMany',
		'TODO:DOC',
		[ 'value', Val ]),
	BlockBag = makeType(BlockVal)('BlockBag',
		'TODO:DOC',
		[ 'built', LocalDeclareBuilt, 'lines', [Union(LineContent, BagEntry)] ],
		{ },
		{ of: (loc, lines) => BlockBag(loc, LocalDeclareBuilt(loc), lines) }),

	MapEntry = d('MapEntry',
		'TODO:DOC',
		[ 'key', Val, 'val', Val ]),
	BlockMap = makeType(BlockVal)('BlockMap',
		'TODO:DOC',
		[ 'built', LocalDeclareBuilt, 'lines', [Union(LineContent, MapEntry)] ],
		{ },
		{ of: (loc, lines) => BlockMap(loc, LocalDeclareBuilt(loc), lines) }),

	LocalAccess = v('LocalAccess',
		'TODO:DOC',
		[ 'name', String ],
		{ },
		{ focus: loc => LocalAccess(loc, '_'), this: loc => LocalAccess(loc, 'this') }),
	GlobalAccess = v('GlobalAccess',
		'TODO:DOC',
		[ 'name', JsGlobals ]),

	LocalMutate = d('LocalMutate',
		'TODO:DOC',
		[
			'name', String,
			'value', Val
		]),

	// Module
	UseDo = m('UseDo',
		'TODO:DOC',
		[ 'path', String ]),
	Use = m('Use',
		'TODO:DOC',
		[
			'path', String,
			'used', [LocalDeclare],
			'opUseDefault', Nullable(LocalDeclare)
		]),
	Module = m('Module',
		'TODO:DOC',
		[
			'doUses', [UseDo],
			'uses', [Use],
			'debugUses', [Use],
			'lines', [Do],
			'exports', [LocalDeclare],
			'opDefaultExport', Nullable(Val)
		]),

	// Data
	BagSimple = v('BagSimple',
		'TODO:DOC',
		[ 'parts', [Val] ]),
	ObjPair = m('ObjPair',
		'TODO:DOC',
		[
			'key', String,
			'value', Val
		]),
	// Verifier checks that no two pairs may have the same key.
	ObjSimple = v('ObjSimple',
		'TODO:DOC',
		[ 'pairs', [ObjPair] ]),

	// Case
	Pattern = m('Pattern',
		'TODO:DOC',
		[
			'type', Val,
			'locals', [LocalDeclare],
			'patterned', LocalAccess
		]),
	CaseDoPart = m('CaseDoPart',
		'TODO:DOC',
		[
			'test', Union(Val, Pattern),
			'result', BlockDo
		]),
	CaseValPart = m('CaseValPart',
		'TODO:DOC',
		[
			'test', Union(Val, Pattern),
			'result', BlockVal
		]),
	CaseDo = d('CaseDo',
		'TODO:DOC',
		[
			'opCased', Nullable(AssignSingle),
			'parts', [CaseDoPart],
			'opElse', Nullable(BlockDo)
		]),
	// Unlike CaseDo, this has `return` statements.
	CaseVal = v('CaseVal',
		'TODO:DOC',
		[
			'opCased', Nullable(AssignSingle),
			'parts', [CaseValPart],
			'opElse', Nullable(BlockVal)
		]),

	SwitchDoPart = m('SwitchDoPart',
		'TODO:DOC',
		[
			'value', Val,
			'result', BlockDo
		]),
	SwitchValPart = m('SwitchValPart',
		'TODO:DOC',
		[
			'value', Val,
			'result', BlockVal
		]),
	SwitchDo = d('SwitchDo',
		'TODO:DOC',
		[
			'switched', Val,
			'parts', [SwitchDoPart],
			'opElse', Nullable(BlockDo)
		]),
	SwitchVal = v('SwitchVal',
		'TODO:DOC',
		[
			'switched', Val,
			'parts', [SwitchValPart],
			'opElse', Nullable(BlockVal)
		]),

	Iteratee = m('Iteratee',
		'TODO:DOC',
		[
			'element', LocalDeclare,
			'bag', Val
		]),


	ForDo = d('ForDo',
		'TODO:DOC',
		[ 'opIteratee', Nullable(Iteratee), 'block', BlockDo ]),
	ForVal = v('ForVal',
		'TODO:DOC',
		[ 'opIteratee', Nullable(Iteratee), 'block', BlockDo ]),
	ForBag = v('ForBag',
		'TODO:DOC',
		[ 'built', LocalDeclareBuilt, 'opIteratee', Nullable(Iteratee), 'block', BlockDo ],
		{ },
		{
			of: (loc, opIteratee, block) => ForBag(loc, LocalDeclareBuilt(loc), opIteratee, block)
		}),

	Break = d('Break',
		'TODO:DOC',
		[ ]),
	BreakWithVal = d('BreakWithVal',
		'TODO:DOC',
		[ 'value', Val ]),
	Continue = d('Continue',
		'TODO:DOC',
		[ ]),

	// Except
	Catch = m('CatchDo',
		'TODO:DOC',
		[ 'caught', LocalDeclare, 'block', BlockDo ]),
	ExceptDo = d('ExceptDo',
		'TODO:DOC',
		[ '_try', BlockDo, '_catch', Nullable(Catch), '_finally', Nullable(BlockDo) ]),
	ExceptVal = v('ExceptVal',
		'TODO:DOC',
		[ '_try', BlockVal, '_catch', Nullable(Catch), '_finally', Nullable(BlockDo) ]),
	Assert = d('Assert',
		'TODO:DOC',
		// condition treated specially if a Call.
		[ 'negate', Boolean, 'condition', Val, 'opThrown', Nullable(Val) ]),

	// Other statements
	ConditionalDo = d('ConditionalDo',
		'TODO:DOC',
		[ 'test', Val, 'result', BlockDo, 'isUnless', Boolean ]),

	ConditionalVal = v('ConditionalVal',
		'TODO:DOC',
		[ 'test', Val, 'result', BlockVal, 'isUnless', Boolean ]),

	// Generators
	Yield = v('Yield',
		'TODO:DOC',
		[ 'opYielded', Nullable(Val) ]),
	YieldTo = v('YieldTo',
		'TODO:DOC',
		[ 'yieldedTo', Val ]),

	// Other Vals
	L_And = 0,
	L_Or = 1,
	Logic = v('Logic',
		'TODO:DOC',
		[ 'kind', Number, 'args', [Val] ]),
	Not = v('Not',
		'TODO:DOC',
		[ 'arg', Val ]),
	Splat = m('Splat',
		'TODO:DOC',
		[ 'splatted', Val ]),
	Call = v('Call',
		'TODO:DOC',
		[
			'called', Val,
			'args', [Union(Val, Splat)]
		],
		{ },
		{
			contains: (loc, testType, tested) =>
				Call(loc, SpecialVal(loc, SV_Contains), [ testType, tested ]),
			sub: (loc, args) => Call(loc, SpecialVal(loc, SV_Sub), args)
		}),
	New = v('New',
		'TODO:DOC',
		[
			'type', Val,
			'args', [Union(Val, Splat)]
		]),
	BlockWrap = v('BlockWrap',
		'TODO:DOC',
		[ 'block', BlockVal ]),

	Fun = v('Fun',
		'TODO:DOC',
		[
			// TODO:ES6 If null, this compiles to an arrow function `( ... ) => { ... }`.
			'opDeclareThis', Nullable(LocalDeclareThis),
			'isGenerator', Boolean,
			'args', [LocalDeclare],
			'opRestArg', Nullable(LocalDeclare),
			'block', Block,
			'opIn', Nullable(Debug),
			// If non-empty, block should be a BlockVal,
			// and either it has a type or opOut is non-empty.
			'opDeclareRes', Nullable(LocalDeclareRes),
			'opOut', Nullable(Debug),
			'opName', Nullable(String)
		]),

	MethodImpl = m('MethodImpl',
		'TODO:DOC',
		[ 'symbol', Union(String, Val), 'fun', Fun ]),
	ClassDo = m('ClassDo',
		'TODO:DOC',
		[ 'declareFocus', LocalDeclareFocus, 'block', BlockDo ]),
	Class = v('Class',
		'TODO:DOC',
		// Every Fun in statics and methods must have a name.
		[
			'superClass', Nullable(Val),
			'opDo', Nullable(ClassDo),
			'statics', [Fun],
			'opConstructor', Nullable(Fun),
			'methods', [Union(Fun, MethodImpl)],
			'opName', Nullable(String)
		]),

	Lazy = v('Lazy',
		'TODO:DOC',
		[ 'value', Val ]),
	NumberLiteral = v('NumberLiteral',
		'TODO:DOC',
		[ 'value', Number ]),
	Member = v('Member',
		'TODO:DOC',
		[
			'object', Val,
			'name', String
		]),
	// parts are Strings interleaved with Vals.
	Quote = v('Quote',
		'TODO:DOC',
		[ 'parts', [Object] ],
		{ },
		{
			forString: (loc, str) => Quote(loc, [ str ])
		}),
	QuoteTemplate = v('QuoteTemplate',
		'TODO:DOC',
		[ 'tag', Val, 'quote', Quote ]),

	SD_Debugger = 0,
	SpecialDo = d('SpecialDo',
		'TODO:DOC',
		[ 'kind', Number ]),

	SV_Contains = 0,
	SV_False = 1,
	SV_Null = 2,
	SV_Sub = 3,
	SV_Super = 4,
	SV_ThisModuleDirectory = 5,
	SV_True = 6,
	SV_Undefined = 7,
	SpecialVal = v('SpecialVal',
		'TODO:DOC',
		[ 'kind', Number ]),

	MS_New = 0,
	MS_Mutate = 1,
	MS_NewMutable = 2,
	MemberSet = d('SetProperty',
		'TODO:DOC',
		[ 'object', Val, 'name', String, 'kind', Number, 'value', Val ]),

	With = v('With',
		'TODO:DOC',
		[ 'declare', LocalDeclare, 'value', Val, 'block', BlockDo ])
