import { assert, compareTypes, getJson } from './helpers.ts'

const LAT = '48.8582'
const LON = '2.2944'

const ACCUWEATHER_CONTENT_STRUCT = {
	meta: { url: 'string' },
	now: { icon: 'string', temp: 'string', feels: 'string', description: 'string' },
	sun: { rise: 'string', set: 'string' },
}

const FORECA_CONTENT_STRUCT = {
	now: {
		icon: 'string',
		humid: 'string',
		description: 'string',
		temp: { c: 'string', f: 'string' },
		feels: { c: 'string', f: 'string' },
		wind: { kmh: 'string', mph: 'string' },
	},
	sun: { rise: 'string', set: 'string' },
}

Deno.test('Debug: content', async function (test) {
	await test.step('accuweather', async function () {
		const json = await getJson({ provider: 'accuweather', debug: 'content', lat: LAT, lon: LON })
		assert(compareTypes(json, ACCUWEATHER_CONTENT_STRUCT))
	})

	await test.step('foreca', async function () {
		const json = await getJson({ provider: 'foreca', debug: 'content', lat: LAT, lon: LON })
		assert(compareTypes(json, FORECA_CONTENT_STRUCT))
	})
})

Deno.test('Debug: nodes', async function (test) {
	await test.step('accuweather', async function () {
		const json = await getJson({ provider: 'accuweather', debug: 'nodes', lat: LAT, lon: LON })
		assert(Array.isArray(json) && json.length > 0)
	})

	await test.step('foreca', async function () {
		const json = await getJson({ provider: 'foreca', debug: 'nodes', lat: LAT, lon: LON })
		assert(Array.isArray(json) && json.length > 0)
	})
})
