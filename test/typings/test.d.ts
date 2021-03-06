declare module 'assert' {
	const assert: any
	export = assert
}

declare module 'benchmark' {
	class Suite {
		add(name: string, test: () => void): void;
		on(name: string, action: (_: any) => void): void;
		run(): void
	}
}

declare module 'fs' {
	export function readFileSync(path: string, encoding: string): string
}

declare module 'process' {
	export const argv: Array<string>
}

declare module 'source-map-support' {
	export function install(): void
}

declare function describe(desc: string, test: () => void): void

declare function it(desc: string, test: () => void): void

declare const module: any

declare const global: any
