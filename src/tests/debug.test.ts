import { assert, getJson, LAT, LON } from './utils.ts'
import type { AccuWeather } from '../types.ts'
import type { FlatNode } from '../parser.ts'

Deno.test('Debug - Nodes (Accuweather)', async function () {
	const json = await getJson<FlatNode[]>({
		provider: 'accuweather',
		debug: 'nodes',
		lat: LAT,
		lon: LON,
	})

	assert(Array.isArray(json), 'Nodes debug should return an array')
	assert(json.length > 0, 'Nodes debug should not be empty')
})

Deno.test('Debug - Content (Accuweather)', async function () {
	const json = await getJson<AccuWeather.Content>({
		provider: 'accuweather',
		debug: 'content',
		lat: LAT,
		lon: LON,
	})

	assert(typeof json === 'object', 'Content debug should return an object')
	assert(!!json.now, 'Content debug should have now data')
})

Deno.test('Debug - Nodes (Foreca)', async function () {
	const json = await getJson<FlatNode[]>({
		provider: 'foreca',
		debug: 'nodes',
		lat: LAT,
		lon: LON,
	})

	assert(Array.isArray(json))
})
