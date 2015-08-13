import { CallExpression, Identifier } from 'esast/dist/ast'
import { member, thunk } from 'esast/dist/util'

const ms = name => {
	const m = member(IdMs, name)
	// TODO:ES6 (...args) => CallExpression(m, args)
	return function() { return CallExpression(m, Array.prototype.slice.call(arguments)) }
}
export const
	IdMs = Identifier('_ms'),
	lazyWrap = value => msLazy(thunk(value)),
	msAdd = ms('add'),
	msAddMany = ms('addMany'),
	msArr = ms('arr'),
	msAssert = ms('assert'),
	msAssertNot = ms('assertNot'),
	msAssoc = ms('assoc'),
	msCheckContains = ms('checkContains'),
	msError = ms('error'),
	msGet = ms('get'),
	msGetDefaultExport = ms('getDefaultExport'),
	msExtract = ms('extract'),
	msGetModule = ms('getModule'),
	msLazy = ms('lazy'),
	msLazyGet = ms('lazyProp'),
	msLazyGetModule = ms('lazyGetModule'),
	msNewMutableProperty = ms('newMutableProperty'),
	msNewProperty = ms('newProperty'),
	msSet = ms('set'),
	msSetName = ms('setName'),
	msSetLazy = ms('setLazy'),
	msSome = ms('some'),
	msSymbol = ms('symbol'),
	msUnlazy = ms('unlazy'),
	MsNone = member(IdMs, 'None')
