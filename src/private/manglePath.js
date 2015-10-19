/** Some Mason modules have names that don't work as URl paths. */
export default function manglePath(path) {
	return path.replace(/!/g, 'bang')
	.replace(/@/g, 'at')
	.replace(/\?/g, 'q')
	.replace(/\$/g, 'cash')
}
