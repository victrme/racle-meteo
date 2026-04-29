import { compareTypes, getJson } from './helpers.ts'
import { STRUCTS } from '../src/types/structs.ts'

const LAT = '48.8582'
const LON = '2.2944'

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
