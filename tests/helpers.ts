import main from '../src/index.ts'
import type { QueryParams, AccuWeather } from '../src/types.ts'

export type OptionalParams = Partial<Record<keyof QueryParams, string>>
export type SomeJson = Record<string, unknown>

export function assert(condition: boolean): void {
	if (!condition) {
		throw new Error('Assertion failed')
	}
}

export function paramsStringify(params: OptionalParams) {
	return Object.entries(params).map(([key, value]) => `&${key}=${value}`).join('').replace('&', '?')
}

export async function getJson(params: OptionalParams): Promise<SomeJson> {
	const resp = await main.fetch(new Request('https://example.com/' + paramsStringify(params)))
	const json = await resp.json()
	return json
}

export function compareTypes(obj: SomeJson, struct: SomeJson): true {
	for (const [key, type] of Object.entries(struct)) {
		if (typeof type === 'object') {
			compareTypes(
				obj[key] as SomeJson,
				type as SomeJson,
			)
			continue
		}

		if (typeof type !== 'string' && typeof obj[key] !== type) {
			throw `"${key}" should be of type "${type}", but got "${typeof obj[
				key
			]}"`
		}
	}

	return true
}

export function isReturningAccuweather(json: unknown): json is AccuWeather.Weather {
	return (json as AccuWeather.Weather)?.meta?.provider === 'accuweather'
}
