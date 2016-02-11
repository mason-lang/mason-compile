/**
Some Mason modules have names that don't work as URl paths.
The build tool is expected to mangle paths too.
*/
export default function manglePath(path: string): string {
	return path.replace(/!/g, 'bang')
	.replace(/@/g, 'at')
	.replace(/\?/g, 'q')
	.replace(/\$/g, 'cash')
}
