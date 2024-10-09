import * as cheerio from 'cheerio/slim'

/**
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Foreca>}
 */
export default async function foreca(lat, lon, lang, unit) {
	const html = await fetchPageContent(lat, lon, lang, unit)
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
				mps: parseInt(json.now.wind.mps),
				mph: parseInt(json.now.wind.mph),
				kmh: parseInt(json.now.wind.kmh),
				bft: parseInt(json.now.wind.bft),
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
				bft: $('.nowcast .wind .wind_bft').text(),
				mps: $('.nowcast .wind .wind_ms').text(),
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
				bft: $(`.daycontainer:nth(${i}) .wind_bft`).text(),
				mps: $(`.daycontainer:nth(${i}) .wind_ms`).text(),
			},
			rain: {
				in: $(`.daycontainer:nth(${i}) .rain_in`).text(),
				mm: $(`.daycontainer:nth(${i}) .rain_mm`).text(),
			},
		})),
	}
}

/**
 * @param {number} lat
 * @param {number} lon
 * @param {string} lang
 * @param {"C" | "F"} unit
 * @returns {Promise<string>}
 */
export async function fetchPageContent(lat, lon, lang, unit) {
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
 * Type returned when calling foreca as provider
 *
 * @typedef {Object} Foreca
 * @prop {string} city
 * @prop {Object} now
 * @prop {string} now.description
 * @prop {Temperature} now.temp
 * @prop {Temperature} now.feels
 * @prop {Temperature} now.low
 * @prop {Temperature} now.high
 * @prop {Wind} now.wind
 * @prop {string} now.humid
 * @prop {Object} sun
 * @prop {[number, number]} sun.rise
 * @prop {[number, number]} sun.set
 * @prop {Daily[]} daily
 */

/**
 * @typedef {Object} Daily
 * @prop {Temperature} daily.low
 * @prop {Temperature} daily.high
 * @prop {Wind} daily.wind
 * @prop {Rain} daily.rain
 */

/**
 * @typedef {Object} Temperature
 * @prop {number} c
 * @prop {number} f
 */

/**
 * @typedef {Object} Wind
 * @prop {number} mps
 * @prop {number} mph
 * @prop {number} kmh
 * @prop {number} bft
 */

/**
 * @typedef {Object} Rain
 * @prop {number} in
 * @prop {number} mm
 */

/**
 * Ids found for a specific location by foreca to display correct weather
 *
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
 * Unprotected API available for all, thanks Foreca devs
 *
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
