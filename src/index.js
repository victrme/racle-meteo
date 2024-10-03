import striptags from 'striptags'
import accuweather from './providers/accuweather.js'
import * as foreca from './providers/foreca.js'

export default { fetch: main }

async function main(request) {
	const url = new URL(request.url)
	const unit = url.searchParams.get('unit') ?? 'C'
	const lang = url.searchParams.get('lang') ?? 'en'
	const lat = url.searchParams.get('lat') ?? request.cf.latitude
	const lon = url.searchParams.get('lon') ?? request.cf.longitude

	let body = undefined
	let status = 200

	try {
		switch (url.pathname) {
			case '/foreca':
			case '/foreca/':
				body = JSON.stringify(await foreca.getForecaData(lat, lon))
				break

			case '':
			case '/':
			case '/accuweather':
			case '/accuweather/': {
				body = JSON.stringify(await accuweather(lat, lon, lang, unit))
				break
			}

			default:
				status = 404
		}
	} catch (error) {
		console.error(error)
		body = error.message
		status = 503
	}

	return new Response(body, {
		status,
		headers: {
			'access-control-allow-methods': 'GET',
			'access-control-allow-origin': '*',
			'content-type': 'application/json',
			'cache-control': 'public, max-age=1800',
		},
	})
}

// Helpers

/**
 * Slice relevent content, strip html tags, split strings.
 * Returns all non-empty tags in an array
 * @param {string} html
 * @param {number} start
 * @param {number} end
 * @param {[string[]]} allowed_tags
 * @returns {string[]}
 */
export function htmlContentToStringArray(html, start, end, allowed_tags) {
	html = html.slice(start, end)
	html = striptags(html, allowed_tags, '\n')
	html = html.split('\n').filter((v) => v.trim())

	return html
}

/**
 * To use if the webpage changes somehow.
 * Use it by uncommenting "console.log(locateNumbers(list))"
 * @param {string[]} list
 * @returns {number[]}
 */
export function locateNumbers(list) {
	return list
		.map((str, i) => (Number.isInteger(parseInt(str)) ? i : undefined))
		.filter((val) => typeof val === 'number')
}
