import index from './index.html'
import accuweather from './providers/accuweather.js'

export default { fetch: main }

async function main(request) {
	const url = new URL(request.url)
	const unit = url.searchParams.get('unit') ?? 'C'
	const lang = url.searchParams.get('lang') ?? 'en'
	const lat = url.searchParams.get('lat') ?? request.cf.latitude
	const lon = url.searchParams.get('lon') ?? request.cf.longitude
	const provider = url.searchParams.get('provider') ?? ''

	let body
	let status = 200
	let contentType = 'application/json'
	let cacheControl = 'public, max-age=1800'

	try {
		if (url.pathname !== '/') {
			status = 404
			contentType = 'text/plain'
			cacheControl = 'nocache'
		}
		//
		else if (provider === 'accuweather') {
			body = JSON.stringify(await accuweather(lat, lon, lang, unit))
		}
		//
		else if (provider === 'foreca') {
			body = JSON.stringify(await foreca(lat, lon, lang, unit))
		}
		//
		else {
			body = index
			contentType = 'text/html'
		}
	} catch (error) {
		status = error.message === 'Language is not valid' ? 400 : 503
		body = `{"status": ${status}, "error": "${error.message}"}`
		console.error(error)
	}

	return new Response(body, {
		status,
		headers: {
			'access-control-allow-methods': 'GET',
			'access-control-allow-origin': '*',
			'content-type': contentType,
			'cache-control': cacheControl,
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
