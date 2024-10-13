import foreca from './providers/foreca.js'
import accuweather from './providers/accuweather.js'
import { toSimpleWeather } from './providers/simple.js'

export default { fetch: main }

async function main(request) {
	const url = new URL(request.url)
	const unit = url.searchParams.get('unit') ?? 'C'
	const lang = url.searchParams.get('lang') ?? 'en'
	const data = url.searchParams.get('data') ?? 'all'
	const query = url.searchParams.get('query') ?? ''
	const lat = url.searchParams.get('lat') ?? request.cf.latitude
	const lon = url.searchParams.get('lon') ?? request.cf.longitude
	const provider = url.searchParams.get('provider') ?? ''

	const params = sanitizeParams({ lat, lon, lang, unit, provider, data, query })

	let body
	let json
	let status = 200
	let contentType = 'application/json'
	let cacheControl = 'public, max-age=1800'

	try {
		if (url.pathname !== '/') {
			status = 404
			contentType = 'text/plain'
			cacheControl = 'no-cache'
		}
		//
		else if (provider === 'accuweather') {
			json = await accuweather(params)
		}
		//
		else if (provider === 'foreca') {
			json = await foreca(params)
		}
		//
		else {
			body = (await import('./index.html')).default
			contentType = 'text/html'
		}
	} catch (error) {
		status = error.message === 'Language is not valid' ? 400 : 503
		body = `{"status": ${status}, "error": "${error.message}"}`
		console.error(error)
	}

	if (data === 'all' && json) {
		body = JSON.stringify(json)
	}

	if (data === 'simple' && json) {
		json = toSimpleWeather(json, params)
		body = JSON.stringify(json)
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

/**
 * @param {QueryParams} params
 * @returns {QueryParams}
 */
function sanitizeParams(params) {
	let { provider, lang, unit, data } = params

	const providerList = ['accuweather', 'foreca', '']
	const dataList = ['all', 'simple']
	const unitList = ['C', 'F']

	provider = provider.toLowerCase()
	lang = lang.toLowerCase().replace('-', '_')
	unit = unit.toUpperCase()
	data = data.toLowerCase()

	if (!providerList.includes(provider)) {
		provider = ''
	}
	if (unitList.includes(unit)) {
		unit = 'C'
	}
	if (dataList.includes(data)) {
		data = 'all'
	}
	if (provider === 'foreca') {
		lang = lang.slice(0, 2)
	}
	if (provider === 'accuweather') {
		if (lang === 'pt') {
			lang = 'pt_pt'
		}
	}

	return params
}

/**
 * @typedef {Object} QueryParams
 * @prop {"accuweather" | "foreca"} provider
 * @prop {"all" | "simple"} data
 * @prop {"C" | "F"} unit
 * @prop {string} query
 * @prop {string} lang
 * @prop {string} lat
 * @prop {string} lon
 */
