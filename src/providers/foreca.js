import { decode } from 'html-entities'

/**
 *
 * @param {number} lon
 * @param {number} lat
 * @param {string} lang
 * @param {"C" | "F"} unit
 * @returns {Promise<string>}
 */
export async function getWeatherHTML(lat, lon, lang, unit) {
	const { id, defaultName } = await getForecaLocation(lon, lat)

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
 * @param {number} lon
 * @param {number} lat
 * @returns {Promise<ForecaGeo>}
 */
export async function getForecaLocation(lon, lat) {
	const resp = await fetch(`https://api.foreca.net/locations/${lon},${lat}.json`)
	const json = await resp.json()
	return json
}

/**
 *
 * @param {number} lon
 * @param {number} lat
 * @returns {Promise<Record<string, ApiForecaNet[]>>}
 */
export async function getForecaData(lat, lon) {
	const { id } = await getForecaLocation(lat, lon)
	const resp = await fetch(`https://api.foreca.net/data/favorites/${id}.json`)
	return await resp.json()
}

/**
 * @typedef {Object} ForecaGeo
 * @param {string} id
 * @param {string} numeric_id
 * @param {number} lon
 * @param {number} lat
 * @param {number} elevation
 * @param {number} population
 * @param {string} continentId
 * @param {string} countryId
 * @param {string} timezone
 * @param {string} name
 * @param {string} countryName
 * @param {string} defaultName
 * @param {string} defaultCountryName
 */

/**
 * @typedef {Object} ApiForecaNet
 * @param {string} date
 * @param {string} symb
 * @param {number} tmin
 * @param {number} tmax
 * @param {number} rain
 * @param {number} rainp
 * @param {number} snowp
 * @param {number} snowff
 * @param {number} rhum
 * @param {number} windd
 * @param {number} winds
 * @param {string} sunrise
 * @param {string} sunset
 * @param {string} daylen
 * @param {number} uvi
 * @param {string} updated
 */
