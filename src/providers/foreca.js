import { htmlContentToStringArray } from '../index.js'
import { decode } from 'html-entities'

/**
 * @param {number} lat
 * @param {number} lon
 */
export default async function foreca(lat, lon, lang, unit) {
	const html = await getWeatherHTML(lat, lon, lang, unit)
	const json = weatherHtmlToJson(html)
	const api = validateJson(json)

	// console.log(html)
	// console.log(json)
	// console.log(api)

	return api
}

/**
 * @param {Record<string, string>} json
 * @returns {unknown}
 */
function validateJson(json) {
	const date = new Date()
	const [riseHour, riseMinutes] = json.sun.rise?.split(':')
	const [setHour, setMinutes] = json.sun.set?.split(':')

	date.setMilliseconds(0)

	date.setUTCHours(parseInt(riseHour))
	date.setUTCMinutes(parseInt(riseMinutes))
	const rise = date.toISOString()

	date.setUTCHours(parseInt(setHour))
	date.setUTCMinutes(parseInt(setMinutes))
	const set = date.toISOString()

	return {
		city: json.city,
		now: {
			description: json.now.description,
			temp: {
				c: parseInt(json.now.temp.c),
				f: parseInt(json.now.temp.f),
			},
			feels: {
				c: parseInt(json.now.feels.c),
				f: parseInt(json.now.feels.f),
			},
			min: {
				c: parseInt(json.now.min.c),
				f: parseInt(json.now.min.f),
			},
			max: {
				c: parseInt(json.now.max.c),
				f: parseInt(json.now.max.f),
			},
			wind: {
				mps: parseInt(json.now.wind.mps),
				mph: parseInt(json.now.wind.mph),
				kmh: parseInt(json.now.wind.kmh),
				bft: parseInt(json.now.wind.bft),
			},
			humid: json.now.humid + '%',
			pressure: parseInt(json.now.pressure),
		},
		sun: {
			rise: rise,
			set: set,
		},
		daily: json.daily?.map((day) => ({
			min: {
				c: parseInt(day.min.c),
				f: parseInt(day.min.f),
			},
			max: {
				c: parseInt(day.max.c),
				f: parseInt(day.max.f),
			},
			wind: {
				mps: parseInt(day.wind.mps),
				mph: parseInt(day.wind.mph),
				kmh: parseInt(day.wind.kmh),
				bft: parseInt(day.wind.bft),
			},
			rain: {
				in: parseFloat(day.rain.in),
				mm: parseFloat(day.rain.mm),
			},
		})),
	}
}

/**
 * @param {string} html
 * @returns {Record<string, unknown>}
 */
export function weatherHtmlToJson(html) {
	const list = (html = htmlContentToStringArray(
		html,
		html.indexOf('<main'),
		html.lastIndexOf('</main')
	))

	const daily = []

	for (let i = 46; i < 131; i += 17) {
		daily.push({
			max: {
				c: list[i],
				f: list[i + 1],
			},
			min: {
				c: list[i + 3],
				f: list[i + 4],
			},
			wind: {
				mph: list[i + 5],
				kmh: list[i + 7],
				bft: list[i + 9],
				mps: list[i + 11],
			},
			rain: {
				in: list[i + 13],
				mm: list[i + 14],
			},
		})
	}

	return {
		city: list[0],
		now: {
			temp: {
				c: list[1],
				f: list[2],
			},
			feels: {
				c: list[4],
				f: list[5],
			},
			wind: {
				mps: list[6],
				mph: list[7],
				kmh: list[8],
				bft: list[9],
			},
			gust: {
				mps: list[11],
				mph: list[13],
				kmh: list[15],
				bft: list[17],
			},
			description: list[19],
			humid: list[25],
			pressure: list[28],

			max: {
				c: list[46],
				f: list[47],
			},
			min: {
				c: list[49],
				f: list[50],
			},
		},
		sun: {
			rise: list[36],
			set: list[40],
		},
		daily: daily,
	}
}

/**
 *
 * @param {number} lat
 * @param {number} lon
 * @param {string} lang
 * @param {"C" | "F"} unit
 * @returns {Promise<string>}
 */
export async function getWeatherHTML(lat, lon, lang, unit) {
	if (VALID_LANGUAGES.indexOf(lang) === -1) {
		throw new Error('Language is not valid')
	}

	const { id, defaultName } = await getForecaLocation(lat, lon)

	if (!id || !defaultName) {
		throw new Error('Cannot get foreca ID or name')
	}

	const userAgent =
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0'

	const cookies = `fcaId=${id}; fcai18n=${lang}; fcaSettings-v2={"units":{"temp":"${unit}","wind":"kmh","rain":"mm","pres":"hPa","vis":"km"},"time":"24h","theme":"dark","language":"${lang}"};`

	const forecaPath = `https://www.foreca.com/${lang}/${id}/${defaultName}`
	const forecaResp = await fetch(forecaPath, {
		headers: {
			Accept: 'text/html',
			'Accept-Encoding': 'gzip',
			'Accept-Language': 'en',
			'User-Agent': userAgent,
			Cookie: cookies,
		},
	})

	let html = await forecaResp.text()
	html = html.slice(html.indexOf('</head>'))
	html = html.replaceAll('\n', '').replaceAll('\t', '')
	html = decode(html)

	return html
}

const VALID_LANGUAGES =
	'en, bg, cs, da, de, et, el, es, fr, hr, it, lv, hu, nl, pl, pt, ro, ru, sk, sv, uk'

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

/**
 *
 * @param {number} lon
 * @param {number} lat
 * @returns {Promise<Record<string, ForecaNetApi[]>}
 */
export async function getForecaData(lat, lon) {
	const { id } = await getForecaLocation(lat, lon)
	const resp = await fetch(`https://api.foreca.net/data/favorites/${id}.json`)
	return await resp.json()
}

/**
 * @typedef {Object} ForecaGeo
 * @prop {string} id
 * @prop {string} numeric_id
 * @prop {number} lon
 * @prop {number} lat
 * @prop {number} elevation
 * @prop {number} population
 * @prop {string} continentId
 * @prop {string} countryId
 * @prop {string} timezone
 * @prop {string} name
 * @prop {string} countryName
 * @prop {string} defaultName
 * @prop {string} defaultCountryName
 */

/**
 * @typedef {Object} ForecaNetApi
 * @prop {string} date
 * @prop {string} symb
 * @prop {number} tmin
 * @prop {number} tmax
 * @prop {number} rain
 * @prop {number} rainp
 * @prop {number} snowp
 * @prop {number} snowff
 * @prop {number} rhum
 * @prop {number} windd
 * @prop {number} winds
 * @prop {string} sunrise
 * @prop {string} sunset
 * @prop {string} daylen
 * @prop {number} uvi
 * @prop {string} updated
 */
