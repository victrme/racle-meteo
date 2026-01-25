import { getJson, assert, LAT, LON } from './utils.ts'
import type { AccuWeather } from '../types.ts'

Deno.test('Weather.com - Basic weather fetch', async function () {
    const json = await getJson<AccuWeather.Weather>({
        provider: 'weathercom',
        lat: LAT,
        lon: LON,
    })

    // Check for some expected fields based on Weather.com implementation
    assert(!!json.now, 'Should have now data')
    assert(!!json.meta, 'Should have meta data')
})
