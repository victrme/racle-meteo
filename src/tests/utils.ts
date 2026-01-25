import { QueryParams } from '../types.ts'
import main from '../index.ts'

export type OptionalParams = Partial<Record<keyof QueryParams, string>>
export type SomeJson = Record<string, any>

export const LAT = '48.8582'
export const LON = '2.2944'

export function assert(condition: boolean, message = 'Assertion failed'): void {
	if (!condition) {
		throw new Error(message)
	}
}

export function paramsStringify(params: OptionalParams) {
	return Object.entries(params).map(([key, value]) => `&${key}=${value}`).join('').replace('&', '?')
}

export async function getJson<T>(params: OptionalParams): Promise<T> {
	const resp = await main.fetch(new Request('https://example.com/' + paramsStringify(params)))
	const json = await resp.json()
	return json
}

export function compareTypes(obj: any, struct: any): true {
	for (const [key, type] of Object.entries(struct)) {
		if (typeof type === 'object') {
			if (Array.isArray(type)) {
				assert(Array.isArray(obj[key]), `"${key}" should be an array`)
				if (type.length > 0 && (obj[key] as any[]).length > 0) {
					// Recursively check first element of array
					compareTypes((obj[key] as any[])[0], type[0])
				}
			} else {
				compareTypes(
					obj[key],
					type,
				)
			}
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
