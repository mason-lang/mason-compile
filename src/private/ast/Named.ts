import Class from './Class'
import {FunBlock} from './Fun'
import {Val} from './LineContent'
import Poly from './Poly'
import Trait from './Trait'
import {SpecialVal, SpecialVals} from './Val'

type Named = Class | FunBlock | Poly | Trait | SpecialVal
export default Named

export function isNamed(_: Val): _ is Named {
	return _ instanceof Class ||
		_ instanceof FunBlock ||
		_ instanceof Poly ||
		_ instanceof Trait ||
		_ instanceof SpecialVal && _.kind === SpecialVals.Name
}
