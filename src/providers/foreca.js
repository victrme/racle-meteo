import { htmlContentToStringArray } from '../index.js'
import { decode } from 'html-entities'

/**
 * @param {string} html
 * @returns {string[]}
 */
export function parseContent(html) {
	const list = (html = htmlContentToStringArray(
		html,
		html.indexOf('<main'),
		html.lastIndexOf('</main')
	))

	return {
		temp: list[1],
		feels: list[4],
		wind: list[8],
		tmax: list[46],
		tmin: list[49],
		desc: list[19],
		humid: list[25],
		pressure: list[28],
		sunrise: list[36],
		sunset: list[40],
	}

	return list
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
	const { id, defaultName } = await getForecaLocation(lat, lon)

	if (!id || !defaultName) {
		throw Error('Cannot get id or name')
	}

	const userAgent =
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0'

	const cookies = `fcaId=${id}; fcai18n=${lang}; fcaSettings-v2={"units":{"temp":"${unit}","wind":"kmh","rain":"mm","pres":"hPa","vis":"km"},"time":"24h","theme":"dark","language":"${lang}"};`

	const forecaPath = `https://www.foreca.com/${id}/${defaultName}`
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

/**
 *
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
