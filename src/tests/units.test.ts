import { getJson, assert, LAT, LON } from './utils.ts'
import type { AccuWeather, Foreca } from '../types.ts'

Deno.test('Units - Fahrenheit conversion (Accuweather)', async function () {
    const jsonC = await getJson<AccuWeather.Weather>({
        provider: 'accuweather',
        unit: 'C',
        lat: LAT,
        lon: LON,
    })

    const jsonF = await getJson<AccuWeather.Weather>({
        provider: 'accuweather',
        unit: 'F',
        lat: LAT,
        lon: LON,
    })

    const tempC = jsonC.now.temp
    const tempF = jsonF.now.temp

    // Simple check: F should be higher than C in normal conditions (Paris) or at least different
    // Formula: (C * 9/5) + 32 = F
    const expectedF = Math.round((tempC * 9 / 5) + 32)
    assert(Math.abs(tempF - expectedF) <= 2, `Expected ~${expectedF}F, got ${tempF}F`)
})

Deno.test('Units - Fahrenheit conversion (Foreca)', async function () {
    const json = await getJson<Foreca.Weather>({
        provider: 'foreca',
        lat: LAT,
        lon: LON,
    })

    // Foreca usually returns both
    assert(typeof json.now.temp.c === 'number')
    assert(typeof json.now.temp.f === 'number')
})
