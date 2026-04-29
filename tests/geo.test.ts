import { assert, compareTypes, getJson, SomeJson } from './helpers.ts'
import { STRUCTS } from '../src/types/structs.ts'

const LAT = '48.8582'
const LON = '2.2944'

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
