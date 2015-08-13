export default path =>
	path.replace(/!/g, 'bang')
	.replace(/@/g, 'at')
	.replace(/\?/g, 'q')
	.replace(/\$/g, 'cash')
