// TODO:ES6 Recursive modules should work, so this should not be necessary.

export let lexQuote: (indent: number, isRegExp: boolean) => void

export function load(_lexQuote: (indent: number, isRegExp: boolean) => void): void {
	lexQuote = _lexQuote
}
