import {Val} from './LineContent'
import {SpecialVal, SpecialVals} from './Val'

interface Named extends Val {
	isNamed(): void
}
export default Named

export function isNamed(_: Val): _ is Named {
	return 'isNamed' in _ && !(_ instanceof SpecialVal && _.kind !== SpecialVals.Name)
}
