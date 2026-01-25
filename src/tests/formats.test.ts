import { STRUCTS } from '../structs.ts'
import { getJson, compareTypes, LAT, LON } from './utils.ts'
import type { Simple } from '../types.ts'

Deno.test('Formats - Accuweather (simple)', async function () {
    compareTypes(
        await getJson<Simple.Weather>({
            provider: 'accuweather',
            data: 'simple',
            lat: LAT,
            lon: LON,
        }),
        STRUCTS.SIMPLE.WEATHER,
    )
})

Deno.test('Formats - Foreca (simple)', async function () {
    compareTypes(
        await getJson<Simple.Weather>({
            provider: 'foreca',
            data: 'simple',
            lat: LAT,
            lon: LON,
        }),
        STRUCTS.SIMPLE.WEATHER,
    )
})

Deno.test('Formats - Auto (always simple)', async function () {
    compareTypes(
        await getJson<Simple.Weather>({
            provider: 'auto',
            data: 'all',
            lat: LAT,
            lon: LON,
        }),
        STRUCTS.SIMPLE.WEATHER,
    )
})
