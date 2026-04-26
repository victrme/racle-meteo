import { compareTypes, getJson } from './helpers.ts'
import { STRUCTS } from '../src/structs.ts'

const LAT = '48.8582'
const LON = '2.2944'

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
