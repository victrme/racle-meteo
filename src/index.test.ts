import { QueryParams } from './types.ts'
import { STRUCTS } from './structs.ts'
import main from './index.ts'

type OptionalParams = Partial<Record<keyof QueryParams, string>>
type SomeJson = Record<string, unknown>

const LAT = '48.8582'
const LON = '2.2944'

// Providers

Deno.test('Providers', async function (test) {
	await test.step('Accuweather', async function () {
		compareTypes(
			await getJson({
				provider: 'accuweather',
				lat: LAT,
				lon: LON,
			}),
			STRUCTS.FORECA.WEATHER,
		)
	})

	await test.step('Foreca', async function () {
		compareTypes(
			await getJson({
				provider: 'foreca',
				lat: LAT,
				lon: LON,
			}),
			STRUCTS.FORECA.WEATHER,
		)
	})

	await test.step('Auto', async function () {
		compareTypes(
			await getJson({
				provider: 'auto',
				lat: LAT,
				lon: LON,
			}),
			STRUCTS.SIMPLE.WEATHER,
		)
	})

	await test.step('Wunderground', async function () {
		// compareTypes(
		// 	await getJson({
		// 		provider: 'wunderground',
		// 		lat: LAT,
		// 		lon: LON,
		// 	}),
		// 	STRUCTS.ACCUWEATHER.WEATHER,
		// )
	})
})

// Simple data

Deno.test('Simple data', async function (test) {
	await test.step('Accuweather', async function () {
		compareTypes(
			await getJson({
				provider: 'accuweather',
				data: 'simple',
				lat: LAT,
				lon: LON,
			}),
			STRUCTS.SIMPLE.WEATHER,
		)
	})

	await test.step('Foreca', async function () {
		compareTypes(
			await getJson({
				provider: 'foreca',
				data: 'simple',
				lat: LAT,
				lon: LON,
			}),
			STRUCTS.SIMPLE.WEATHER,
		)
	})

	await test.step('Auto (always "simple")', async function () {
		compareTypes(
			await getJson({
				provider: 'auto',
				data: 'all',
				lat: LAT,
				lon: LON,
			}),
			STRUCTS.SIMPLE.WEATHER,
		)
	})
})

Deno.test('Geo', async function (test) {
	await test.step('Accuweather', async function (test) {
		await test.step('Basic query', async function () {
			const resp = await getJson({
				provider: 'accuweather',
				geo: 'true',
				query: 'Paris',
			})

			compareTypes(resp, STRUCTS.ACCUWEATHER.GEO as unknown as SomeJson)
		})

		await test.step('Fails early with GPS', async function () {
			try {
				await getJson({
					provider: 'accuweather',
					geo: 'true',
					lat: LAT,
					lon: LON,
				})
			} catch (err) {
				const message = (err as Error).message
				assert(message === 'Can only get locations from queries')
			}
		})

		await test.step('Fails early with empty query', async function () {
			try {
				await getJson({
					provider: 'accuweather',
					geo: 'true',
					query: '',
				})
			} catch (err) {
				const message = (err as Error).message
				assert(message === 'Can only get locations from queries')
			}
		})
	})

	await test.step('Foreca', async function () {
		compareTypes(
			await getJson({
				provider: 'accuweather',
				geo: 'true',
				query: 'Paris',
			}),
			STRUCTS.ACCUWEATHER.GEO as unknown as SomeJson,
		)
	})

	await test.step('Simple', async function () {
		compareTypes(
			await getJson({
				provider: 'auto',
				geo: 'true',
				query: 'Paris',
			}),
			STRUCTS.ACCUWEATHER.GEO as unknown as SomeJson,
		)
	})
})

Deno.test('Wrong parameters', async function (test) {
	await test.step('Provider falls back to landing', async function () {
		// await getResp({
		// 	provider: 'what',
		// 	lat: LAT,
		// 	lon: LON,
		// })
	})

	await test.step('Lang falls back to english', async function () {
		const json = await getJson({
			provider: 'accuweather',
			lang: 'dlja',
			lat: LAT,
			lon: LON,
		})

		//@ts-expect-error: unknown json
		assert(json.meta.url.includes('/en/'))
	})

	await test.step('Unit falls back to C', async function () {
		const json = await getJson({
			provider: 'accuweather',
			unit: 'fahrennbeit',
			lat: LAT,
			lon: LON,
		})

		//@ts-expect-error: unknown json
		assert(json.now.temp < 50)
	})

	await test.step('Provider only returns IP location weather', async function () {
		// compareTypes(
		// 	await getJson({ provider: 'accuweather' }),
		// 	STRUCTS.SIMPLE.WEATHER,
		// )
	})
})

// Helpers

function assert(condition: boolean): void {
	if (!condition) {
		throw new Error('Assertion failed')
	}
}

function paramsStringify(params: OptionalParams) {
	return Object.entries(params).map(([key, value]) => `&${key}=${value}`).join('').replace('&', '?')
}

async function getJson(params: OptionalParams): Promise<SomeJson> {
	const resp = await main.fetch(new Request('https://example.com/' + paramsStringify(params)))
	const json = await resp.json()
	return json
}

function compareTypes(obj: SomeJson, struct: SomeJson): true {
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
