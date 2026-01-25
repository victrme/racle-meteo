import { getJson, assert, LAT, LON } from './utils.ts'
import type { AccuWeather } from '../types.ts'

Deno.test('Params - Lang falls back to english', async function () {
    const json = await getJson<AccuWeather.Weather>({
        provider: 'accuweather',
        lang: 'dlja',
        lat: LAT,
        lon: LON,
    })

    assert(json.meta.url.includes('/en/'))
})

Deno.test('Params - Unit falls back to C', async function () {
    const json = await getJson<AccuWeather.Weather>({
        provider: 'accuweather',
        unit: 'fahrennbeit',
        lat: LAT,
        lon: LON,
    })

    assert(json.now.temp < 50)
})
