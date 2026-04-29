import { STRUCTS } from '../src/types/structs.ts'
import { assert, compareTypes, getJson } from './helpers.ts'

const LAT = '48.8582'
const LON = '2.2944'

Deno.test('Debug: content', async function (test) {
	await test.step('accuweather', async function () {
		const json = await getJson({ provider: 'accuweather', debug: 'content', lat: LAT, lon: LON })
		assert(compareTypes(json, STRUCTS.ACCUWEATHER.CONTENT))
	})

	await test.step('foreca', async function () {
		const json = await getJson({ provider: 'foreca', debug: 'content', lat: LAT, lon: LON })
		assert(compareTypes(json, STRUCTS.FORECA.CONTENT))
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
