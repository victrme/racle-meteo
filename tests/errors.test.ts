import { assert, getJson, getResp } from './helpers.ts'

const LAT = '48.8582'
const LON = '2.2944'

Deno.test('Wrong parameters', async function (test) {
	await test.step('Unknown provider returns error', async function () {
		const resp = await getResp({ provider: 'what', lat: LAT, lon: LON })

		assert(resp.status === 200)
		assert(resp.headers.get('content-type') === 'text/plain')
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

	await test.step('404 on unknown path', async function () {
		const resp = await getResp({}, '/bad-path')
		assert(resp.status === 404)
	})

	// await test.step('400 when no location provided', async function () {
	// 	const resp = await getResp({ provider: 'accuweather' })
	// 	assert(resp.status === 400)
	// })

	await test.step('Unencoded query gets encoded', async function () {
		const json = await getJson({ provider: 'accuweather', query: 'Paris,FR' })
		//@ts-expect-error: unknown json
		assert(typeof json.now.temp === 'number')
	})
})
