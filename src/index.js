import index from './index.html'
import foreca from './providers/foreca.js'
import accuweather from './providers/accuweather.js'

export default { fetch: main }

async function main(request) {
	const url = new URL(request.url)
	const unit = url.searchParams.get('unit') ?? 'C'
	const lang = url.searchParams.get('lang') ?? 'en'
	const data = url.searchParams.get('data') ?? 'all'
	const lat = url.searchParams.get('lat') ?? request.cf.latitude
	const lon = url.searchParams.get('lon') ?? request.cf.longitude
	const provider = url.searchParams.get('provider') ?? ''

	const queries = { lat, lon, lang, unit, provider, data }

	let body
	let json
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
			json = await accuweather(lat, lon, lang, unit)
		}
		//
		else if (provider === 'foreca') {
			json = await foreca(lat, lon, lang, unit)
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

	if (data === 'all' && json) {
		body = JSON.stringify(json)
	}

	if (data === 'simple' && json) {
		json = toSimpleWeather(json, queries)
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
 * @param {Record<string, unknown>} json
 * @param {Queries} queries
 * @returns {SimpleWeather}
 */
function toSimpleWeather(json, queries) {
	const { provider, unit } = queries

	const simple = {
		now: {
			icon: json.now.icon,
			description: json.now.description,
		},
		sun: {
			rise: json.sun.rise,
			set: json.sun.set,
		},
		daily: [],
	}

	if (provider === 'foreca') {
		const degrees = unit === 'F' ? 'f' : 'c'

		simple.now.temp = json.now.temp[degrees]
		simple.now.feels = json.now.feels[degrees]

		for (let i = 0; i < 5; i++) {
			const day = json.daily[i]

			simple.daily.push({
				time: day.time,
				high: day.high[degrees],
				low: day.low[degrees],
			})
		}
	}

	if (provider === 'accuweather') {
		simple.now.icon = json.now.icon.toString()
		simple.now.temp = json.now.temp
		simple.now.feels = json.now.feels

		for (let i = 0; i < 5; i++) {
			const day = json.daily[i]

			simple.daily.push({
				time: day.time,
				high: day.high,
				low: day.low,
			})
		}
	}

	return simple
}

/*****************
	JSDoc Types
******************/

/**
 * @typedef {Object} Queries
 * @prop {"accuweather" | "foreca"} provider
 * @prop {"C" | "F"} unit
 * @prop {string} lang
 * @prop {string} lat
 * @prop {string} lon
 */

/**
 * @typedef {Object} SimpleWeather
 * @prop {Object} now - Current weather information, with felt temperature
 * @prop {number} now.icon - Icon ID
 * @prop {number} now.temp - Classic temperature
 * @prop {number} now.feels - Felt temperature, using RealFeel® tech
 * @prop {string} description - Short weather description
 * @prop {Object} sun - Current day sun time information
 * @prop {Date} rise - Sunrise ISO date
 * @prop {Date} set - Sunset ISO date
 * @prop {Daily[]} daily - 5 days of daily forecast
 */

/**
 * @typedef {Object} Daily
 * @prop {number} time - ISO date
 * @prop {number} high - Highest temperature this day
 * @prop {number} low - Lowest temperature this day
 */

/********************
	JSON Type def
*********************/

const SIMPLE_WEATHER_TYPEDEF = {
	now: {
		icon: 'string',
		temp: 'number',
		feels: 'number',
		description: 'string',
	},
	sun: {
		rise: ['number', 'number'],
		set: ['number', 'number'],
	},
	daily: [
		{
			time: 'Date',
			high: 'number',
			low: 'number',
		},
	],
}
