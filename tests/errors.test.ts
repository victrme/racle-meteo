import { assert, getJson } from './helpers.ts'

const LAT = '48.8582'
const LON = '2.2944'

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
