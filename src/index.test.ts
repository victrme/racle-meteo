import { QueryParams } from './types.ts'
import { STRUCTS } from './structs.ts'
import main from './index.ts'

type OptionalParams = Partial<Record<keyof QueryParams, string>>
type SomeJson = Record<string, unknown>

const LAT = '48.8582'
const LON = '2.2944'

// Providers

Deno.test('Provider: Accuweather', async function () {
	compareTypes(
		await getJson({
			provider: 'accuweather',
			lat: LAT,
			lon: LON,
		}),
		STRUCTS.FORECA.WEATHER,
	)
})

Deno.test('Provider: Foreca', async function () {
	compareTypes(
		await getJson({
			provider: 'foreca',
			lat: LAT,
			lon: LON,
		}),
		STRUCTS.FORECA.WEATHER,
	)
})

Deno.test('Provider: Auto', async function () {
	compareTypes(
		await getJson({
			provider: 'auto',
			lat: LAT,
			lon: LON,
		}),
		STRUCTS.SIMPLE.WEATHER,
	)
})

Deno.test.ignore('Provider: Wunderground', async function () {
	compareTypes(
		await getJson({
			provider: 'wunderground',
			lat: LAT,
			lon: LON,
		}),
		STRUCTS.ACCUWEATHER.WEATHER,
	)
})

// Simple data

Deno.test('Simple data: Accuweather', async function () {
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

Deno.test('Simple data: Foreca', async function () {
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

Deno.test('Simple data: Auto overrides "all" data', async function () {
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

Deno.test('Geo: Accuweather', async function () {
	const resp = await getJson({
		provider: 'accuweather',
		geo: 'true',
		query: 'Paris',
		// lat: LAT,
		// lon: LON,
	})

	compareTypes(resp, STRUCTS.ACCUWEATHER.GEO as unknown as SomeJson)
})

Deno.test('Geo: Foreca', async function () {
	compareTypes(
		await getJson({
			provider: 'accuweather',
			geo: 'true',
			query: 'Paris',
			// lat: LAT,
			// lon: LON,
		}),
		STRUCTS.ACCUWEATHER.GEO as unknown as SomeJson,
	)
})

Deno.test.ignore('Geo: Simple', async function () {
	compareTypes(
		await getJson({
			provider: 'accuweather',
			geo: 'true',
			lat: LAT,
			lon: LON,
		}),
		STRUCTS.ACCUWEATHER.GEO as unknown as SomeJson,
	)
})

// Params

Deno.test.ignore('Params: Wrong provider falls back to landing', async function () {
	await getResp({
		provider: 'what',
		lat: LAT,
		lon: LON,
	})
})

Deno.test('Params: Wrong lang falls back to english', async function () {
	const json = await getJson({
		provider: 'accuweather',
		lang: 'dlja',
		lat: LAT,
		lon: LON,
	})

	//@ts-expect-error: unknown json
	assert(json.meta.url.includes('/en/'))
})

Deno.test('Params: Wrong unit falls back to C', async function () {
	const json = await getJson({
		provider: 'accuweather',
		unit: 'fahrennbeit',
		lat: LAT,
		lon: LON,
	})

	//@ts-expect-error: unknown json
	assert(json.now.temp < 50)
})

Deno.test('Params: Has provider & no query/coords', async function () {
	const req = new Request(`https://example.com?provider=accuweather`)
	const resp = await main.fetch(req)
	assert(resp.status === 503)
	console.clear()
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

async function getResp(params: OptionalParams): Promise<Response> {
	const resp = await main.fetch(new Request('https://example.com/' + paramsStringify(params)))
	return resp
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
