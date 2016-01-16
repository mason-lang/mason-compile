import MemberName from '../ast/MemberName'
import verifyVal from './verifyVal'

/** Verify if it's not a string. */
export default function verifyMemberName(_: MemberName): void {
	if (typeof _ !== 'string')
		verifyVal(_)
}
