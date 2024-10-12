import * as cheerio from 'cheerio/slim'

/** @typedef {import('../index.js').QueryParams} QueryParams */
/** @typedef {import('../types.js').ForecaNetApi} ForecaNetApi */
/** @typedef {import('../types.js').ForecaGeo} ForecaGeo */
/** @typedef {import('../types.js').Foreca} Foreca */

const FORECA_LANGS =
	'en, bg, cs, da, de, et, el, es, fr, hr, it, lv, hu, nl, pl, pt, ro, ru, sk, sv, uk'

/**
 * @param {QueryParams} params
 * @returns {Promise<Foreca>}
 */
export default async function foreca(params) {
	const html = await fetchPageContent(params)
	const json = transformToJson(html)
	const api = validateJson(json)

	return api
}

/**
 * @param {Record<string, unknown>} json
 * @returns {Foreca}
 */
function validateJson(json) {
	const [riseHour, riseMinutes] = json.sun.rise?.split(':')
	const [setHour, setMinutes] = json.sun.set?.split(':')

	const result = {
		city: json.city,
		now: {
			icon: json.now.icon.replace('/public/images/symbols/', '').replace('.svg', ''),
			description: json.now.description,
			humid: json.now.humid + '%',
			temp: {
				c: parseInt(json.now.temp.c),
				f: parseInt(json.now.temp.f),
			},
			feels: {
				c: parseInt(json.now.feels.c),
				f: parseInt(json.now.feels.f),
			},
			wind: {
				kmh: parseInt(json.now.wind.kmh),
				mph: parseInt(json.now.wind.mph),
			},
		},
		sun: {
			rise: [parseInt(riseHour), parseInt(riseMinutes)],
			set: [parseInt(setHour), parseInt(setMinutes)],
		},
		daily: json.daily?.map((day) => ({
			low: {
				c: parseInt(day.low.c),
				f: parseInt(day.low.f),
			},
			high: {
				c: parseInt(day.high.c),
				f: parseInt(day.high.f),
			},
			wind: {
				kmh: parseInt(day.wind.kmh),
				mph: parseInt(day.wind.mph),
			},
			rain: {
				in: parseFloat(day.rain.in),
				mm: parseFloat(day.rain.mm),
			},
		})),
	}

	const date = new Date()
	date.setMinutes(0)
	date.setSeconds(0)
	date.setMilliseconds(0)

	result.daily = result.daily.map((day) => {
		const time = date.toISOString()

		date.setDate(date.getDate() + 1)

		return {
			time: time,
			...day,
		}
	})

	return result
}

/**
 * @param {string} html
 * @returns {Record<string, unknown>}
 */
export function transformToJson(html) {
	const $ = cheerio.load(html)

	return {
		city: $('h1').text(),
		now: {
			temp: {
				c: $('.nowcast .temp p:nth(0) .temp_c').text(),
				f: $('.nowcast .temp p:nth(0) .temp_f').text(),
			},
			feels: {
				c: $('.nowcast .temp p:nth(1) .temp_c').text(),
				f: $('.nowcast .temp p:nth(1) .temp_f').text(),
			},
			wind: {
				kmh: $('.nowcast .wind .wind_kmh').text(),
				mph: $('.nowcast .wind .wind_mph').text(),
			},
			icon: $('.nowcast .symb img').attr('src'),
			description: $('.nowcast .wx').text(),
			humid: $('.nowcast .rhum em').text(),
		},
		sun: {
			rise: $('.nowcast .sun .time_24h:nth(0)').text(),
			set: $('.nowcast .sun .time_24h:nth(1)').text(),
		},
		daily: new Array(5).fill('').map((_, i) => ({
			high: {
				c: $(`.daycontainer:nth(${i}) .tempmax .temp_c`).text(),
				f: $(`.daycontainer:nth(${i}) .tempmax .temp_f`).text(),
			},
			low: {
				c: $(`.daycontainer:nth(${i}) .tempmin .temp_c`).text(),
				f: $(`.daycontainer:nth(${i}) .tempmin .temp_f`).text(),
			},
			wind: {
				mph: $(`.daycontainer:nth(${i}) .wind_mph`).text(),
				kmh: $(`.daycontainer:nth(${i}) .wind_kmh`).text(),
			},
			rain: {
				in: $(`.daycontainer:nth(${i}) .rain_in`).text(),
				mm: $(`.daycontainer:nth(${i}) .rain_mm`).text(),
			},
		})),
	}
}

/**
 * @param {QueryParams} params
 * @returns {Promise<string>}
 */
export async function fetchPageContent(params) {
	const { lang, unit, lat, lon } = params

	if (FORECA_LANGS.includes(lang) === false) {
		throw new Error('Language is not valid')
	}

	const { id, defaultName } = await getForecaLocation(lat, lon)

	if (!id || !defaultName) {
		throw new Error('Cannot get foreca ID or name')
	}

	const userAgent =
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0'
	const cookies = `fcaId=${id}; fcai18n=${lang}; fcaSettings-v2={"units":{"temp":"${unit}","wind":"kmh","rain":"mm","pres":"hPa","vis":"km"},"time":"24h","theme":"dark","language":"${lang}"};`
	const path = `https://www.foreca.com/${lang}/${id}/${defaultName}`

	const resp = await fetch(path, {
		headers: {
			Accept: 'text/html',
			'Accept-Encoding': 'gzip',
			'Accept-Language': 'en',
			'User-Agent': userAgent,
			Cookie: cookies,
		},
	})

	let html = await resp.text()
	html = html.replaceAll('\n', '').replaceAll('\t', '')

	return html
}

/**
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<ForecaGeo>}
 */
export async function getForecaLocation(lat, lon) {
	const resp = await fetch(`https://api.foreca.net/locations/${lon},${lat}.json`)
	const json = await resp.json()
	return json
}

// /**
//  * @param {number} lon
//  * @param {number} lat
//  * @returns {Promise<Record<string, ForecaNetApi[]>}
//  */
// export async function getForecaData(lat, lon) {
// 	const { id } = await getForecaLocation(lat, lon)
// 	const resp = await fetch(`https://api.foreca.net/data/favorites/${id}.json`)
// 	return await resp.json()
// }
