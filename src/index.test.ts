import { ACCUWEATHER_STRUCT, FORECA_STRUCT, SIMPLE_STRUCT } from './structs.ts'
import main from './index.ts'

Deno.test('Basic Accuweather', async function () {
	const json = await getData('?lat=48.8582&lon=2.2944&provider=accuweather')
	compareTypes(json, ACCUWEATHER_STRUCT)
})

Deno.test('Basic Foreca', async function () {
	const json = await getData('?lat=48.8582&lon=2.2944&provider=foreca')
	compareTypes(json, FORECA_STRUCT)
})

Deno.test('Simple data with Accuweather', async function () {
	const json = await getData(
		'?lat=48.8582&lon=2.2944&provider=accuweather&data=simple',
	)
	compareTypes(json, SIMPLE_STRUCT)
})

Deno.test('Simple data with Foreca', async function () {
	const json = await getData(
		'?lat=48.8582&lon=2.2944&provider=foreca&data=simple',
	)
	compareTypes(json, SIMPLE_STRUCT)
})

async function getData(query: string): Promise<Record<string, unknown>> {
	const resp = await main.fetch(new Request('https://example.com/' + query))
	const json = await resp.json()
	return json
}

function compareTypes(obj: Record<string, unknown>, struct: Record<string, unknown>) {
	for (const [key, type] of Object.entries(struct)) {
		if (typeof type === 'object') {
			compareTypes(
				obj[key] as Record<string, unknown>,
				type as Record<string, unknown>,
			)
			continue
		}

		if (typeof type !== 'string' && typeof obj[key] !== type) {
			throw `"${key}" should be of type "${type}", but got "${typeof obj[
				key
			]}"`
		}
	}
}
