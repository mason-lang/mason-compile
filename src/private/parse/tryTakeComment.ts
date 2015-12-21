import Op from 'op/Op'
import {DocComment} from '../Token'
import {assert, isEmpty} from '../util'
import {Lines} from './Slice'

/** Takes DocComment lines and puts them into a comment. */
export default function tryTakeComment(lines: Lines): [Op<string>, Lines] {
	const comments: Array<DocComment> = []
	let rest = lines

	while (!rest.isEmpty()) {
		const hs = rest.headSlice()
		const h = hs.head()
		if (h instanceof DocComment) {
			assert(hs.size() === 1)
			comments.push(h)
			rest = rest.tail()
		} else
			break
	}

	return [isEmpty(comments) ? null : comments.map(_ => _.text).join('\n'), rest]
}
