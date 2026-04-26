import { assert, compareTypes, getJson, isReturningAccuweather, isReturningForeca } from './helpers.ts'
import { ACCUWEATHER_LANGS } from '../src/providers/accuweather.ts'
import { FORECA_LANGS } from '../src/providers/foreca.ts'
import { STRUCTS } from '../src/structs.ts'

const LAT = '48.8582'
const LON = '2.2944'

const MOST_USED = ['en', 'pt_br', 'zh_cn', 'ru', 'fr', 'es', 'id', 'de', 'zh_tw', 'ar']
const __ = ACCUWEATHER_LANGS.split(', ')
const _ = FORECA_LANGS.split(', ')
let englishDesc = ''

Deno.test('Accuweather language: fallback', async () => {
	const json = await getJson({ provider: 'accuweather', lang: 'xwz', lat: LAT, lon: LON })

	//@ts-expect-error: unknown json
	const url = json.meta.url.toLowerCase()
	const path = new URL(url).pathname

	assert(compareTypes(json, STRUCTS.ACCUWEATHER.WEATHER))
	assert(path.startsWith(`/en/`))
	assert(isReturningAccuweather(json))

	if (isReturningAccuweather(json)) {
		englishDesc = json.now.description
	}
})

for (const lang of MOST_USED) {
	Deno.test(`Accuweather language: ${lang}`, async () => {
		const isNotEnglish = !lang.startsWith('en')
		const params = { provider: 'accuweather', lang, lat: LAT, lon: LON }
		const json = await getJson(params)

		//@ts-expect-error: unknown json
		const url = json.meta.url.toLowerCase()
		const path = new URL(url).pathname
		const smallLang = lang.slice(0, 2)

		assert(compareTypes(json, STRUCTS.ACCUWEATHER.WEATHER))
		assert(path.startsWith(`/${smallLang}/`))
		assert(isReturningAccuweather(json))

		if (isNotEnglish && isReturningAccuweather(json)) {
			assert(json.now.description !== englishDesc)
			console.log(json.now.description, englishDesc)
		}
	})
}

for (const lang of ['en', 'pt_br', 'ru', 'fr', 'es', 'de']) {
	Deno.test(`Forca language: ${lang}`, async () => {
		const isNotEnglish = !lang.startsWith('en')
		const params = { provider: 'foreca', lang, lat: LAT, lon: LON }
		const json = await getJson(params)

		//@ts-expect-error: unknown json
		const url = json.meta.url.toLowerCase()
		const path = new URL(url).pathname
		const smallLang = lang.slice(0, 2)

		assert(compareTypes(json, STRUCTS.FORECA.WEATHER))
		assert(path.startsWith(`/${smallLang}/`))
		assert(isReturningForeca(json))

		if (isNotEnglish && isReturningForeca(json)) {
			assert(json.now.description !== englishDesc)
			console.log(json.now.description, englishDesc)
		}
	})
}
