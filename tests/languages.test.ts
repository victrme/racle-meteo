import { assert, getJson, compareTypes, isReturningAccuweather } from './helpers.ts'
import { ACCUWEATHER_LANGS } from '../src/providers/accuweather.ts'
import { STRUCTS } from '../src/structs.ts'

const LAT = '48.8582'
const LON = '2.2944'

const LANGS = ACCUWEATHER_LANGS.split(', ')
let englishDesc = ''

Deno.test('Accuweather english fallback', async function () {
		const json = await getJson({ provider: 'accuweather', lang: 'xwz', lat: LAT, lon: LON })

		//@ts-expect-error: unknown json
      const url = json.meta.url.toLowerCase()
    		const	path = new URL(url).pathname

      assert(compareTypes(json, STRUCTS.ACCUWEATHER.WEATHER))
      assert(path.startsWith(`/en/`))
      assert(isReturningAccuweather(json))

      if (isReturningAccuweather(json)) {
      		englishDesc = json.now.description
      }
	})

for (const lang of LANGS) {
  Deno.test(`AccuWeather language: ${lang}`, async function () {
        const params = { provider: 'accuweather', lang, lat: LAT, lon: LON }
   			const json = await getJson(params)

   			//@ts-expect-error: unknown json
        const url = json.meta.url.toLowerCase()
     		const	path = new URL(url).pathname
        const smallLang = lang.slice(0, 2)

       assert(compareTypes(json, STRUCTS.ACCUWEATHER.WEATHER))
       assert(path.startsWith(`/${smallLang}/`))
       assert(isReturningAccuweather(json))

       if (isReturningAccuweather(json) && !lang.startsWith('en')) {
         assert(json.now.description !== englishDesc)
       }
    })
}
