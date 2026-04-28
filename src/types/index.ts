export * as Accuweather from './interface/Accuweather.ts'
export * as Foreca from './interface/Foreca.ts'
export * as Simple from './interface/Simple.ts'

export interface QueryParams {
	provider: 'accuweather' | 'foreca' | 'weathercom' | 'auto' | ''
	debug: 'nodes' | 'content' | 'geo' | ''
	data: 'all' | 'simple'
	unit: 'C' | 'F'
	query: string
	lang: string
	lat?: string
	lon?: string
	geo?: unknown
}
