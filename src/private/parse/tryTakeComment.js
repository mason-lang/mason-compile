import {DocComment} from '../Token'
import {assert, isEmpty} from '../util'

export default lines => {
	let comments = []
	let rest = lines

	while (true) {
		if (rest.isEmpty())
			break

		const hs = rest.headSlice()
		const h = hs.head()
		if (!(h instanceof DocComment))
			break

		assert(hs.size() === 1)
		comments.push(h)
		rest = rest.tail()
	}

	return [isEmpty(comments) ? null : comments.map(_ => _.text).join('\n'), rest]
}
