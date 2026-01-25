import { STRUCTS } from '../structs.ts'
import { getJson, compareTypes, assert, LAT, LON } from './utils.ts'
import type { AccuWeather, Simple } from '../types.ts'

Deno.test('Geo - Accuweather Basic query', async function () {
    const resp = await getJson<AccuWeather.Location[]>({
        provider: 'accuweather',
        geo: 'true',
        query: 'Paris',
    })

    compareTypes(resp as unknown as Record<string, unknown>, STRUCTS.ACCUWEATHER.GEO[0] as unknown as Record<string, unknown>)
})

Deno.test('Geo - Accuweather Fails early with GPS', async function () {
    try {
        await getJson({
            provider: 'accuweather',
            geo: 'true',
            lat: LAT,
            lon: LON,
        })
        assert(false, 'Should have failed')
    } catch (err) {
        const message = (err as Error).message
        assert(message === 'Can only get locations from queries')
    }
})

Deno.test('Geo - Accuweather Fails early with empty query', async function () {
    try {
        await getJson({
            provider: 'accuweather',
            geo: 'true',
            query: '',
        })
        assert(false, 'Should have failed')
    } catch (err) {
        const message = (err as Error).message
        assert(message === 'Can only get locations from queries')
    }
})

Deno.test('Geo - Foreca', async function () {
    compareTypes(
        (await getJson<AccuWeather.Location[]>({
            provider: 'accuweather',
            geo: 'true',
            query: 'Paris',
        })) as unknown as Record<string, unknown>,
        STRUCTS.ACCUWEATHER.GEO[0] as unknown as Record<string, unknown>,
    )
})

Deno.test('Geo - Simple (Auto)', async function () {
    compareTypes(
        (await getJson<Simple.Locations>({
            provider: 'auto',
            geo: 'true',
            query: 'Paris',
        })) as unknown as Record<string, unknown>,
        STRUCTS.ACCUWEATHER.GEO[0] as unknown as Record<string, unknown>,
    )
})
