import Class from './Class'
import {FunBlock} from './Fun'
import {Val} from './LineContent'
import Method from './Method'
import Trait from './Trait'
import {SpecialVal, SpecialVals} from './Val'

type Named = Class | FunBlock | Method | Trait | SpecialVal
export default Named

export function isNamed(_: Val): _ is Named {
	return _ instanceof Class ||
		_ instanceof FunBlock ||
		_ instanceof Method ||
		_ instanceof Trait ||
		_ instanceof SpecialVal && _.kind === SpecialVals.Name
}
