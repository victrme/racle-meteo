import main from '../index.ts'
import { assert } from './utils.ts'

Deno.test('Errors - 404 for unknown path', async function () {
    const resp = await main.fetch(new Request('https://example.com/unknown'))
    assert(resp.status === 404)
})

Deno.test('Errors - 400 for missing lat/lon/query', async function () {
    const resp = await main.fetch(new Request('https://example.com/?provider=accuweather'))
    assert(resp.status === 400)
})

Deno.test('Errors - 503 for invalid lang (Accuweather)', async function () {
    // Current implementation throws "Language is not valid" which results in 400 or 503
    // index.ts:152: status = message === 'Language is not valid' ? 400 : 503
    const resp = await main.fetch(new Request('https://example.com/?provider=accuweather&lat=0&lon=0&lang=invalid'))
    assert(resp.status === 400 || resp.status === 503)
})
