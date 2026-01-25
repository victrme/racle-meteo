import { STRUCTS } from '../structs.ts'
import { getJson, compareTypes, LAT, LON } from './utils.ts'
import type { AccuWeather, Foreca, Simple } from '../types.ts'

Deno.test('Providers - Accuweather', async function () {
    compareTypes(
        await getJson<AccuWeather.Weather>({
            provider: 'accuweather',
            lat: LAT,
            lon: LON,
        }),
        STRUCTS.FORECA.WEATHER,
    )
})

Deno.test('Providers - Foreca', async function () {
    compareTypes(
        await getJson<Foreca.Weather>({
            provider: 'foreca',
            lat: LAT,
            lon: LON,
        }),
        STRUCTS.FORECA.WEATHER,
    )
})

Deno.test('Providers - Auto', async function () {
    compareTypes(
        await getJson<Simple.Weather>({
            provider: 'auto',
            lat: LAT,
            lon: LON,
        }),
        STRUCTS.SIMPLE.WEATHER,
    )
})
