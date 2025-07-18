import './parser.ts'
import * as foreca from './providers/foreca.ts'
import * as weathercom from './providers/weathercom.ts'
import * as accuweather from './providers/accuweather.ts'
import toSimpleWeather, { toSimpleLocations } from './providers/simple.ts'
import { isAccuweather, isAccuweatherLocation, isForeca, isForecaLocation } from './types.ts'

import type { AccuWeather, Foreca, QueryParams } from './types.ts'

/**
 * Racle-météo can be called like a Cloudflare Worker, using fetch().
 * Create a GET request with the parameters in the query string.
 *
 * The "provider" parameter is required for requesting weather data.
 *
 * @example
 * import meteo from "path/to/racle-meteo"
 *
 * const request = new Request("https://example.com/?provider=accuweather&query=Paris,FR")
 * const resp = await meteo.fetch()
 * const json = await resp.json()
 *
 * console.log(json)
 */
export default { fetch: main }

async function main(request: Request) {
	// https://developers.cloudflare.com/workers/runtime-apis/request/#options
	type CFRequest = Request & { cf: { latitude?: string; longitude?: string } }
	const cf_latitude = (request as CFRequest)?.cf?.latitude
	const cf_longitude = (request as CFRequest)?.cf?.longitude

	const url = new URL(request.url)
	const geo = url.searchParams.get('geo') ?? ''
	const debug = url.searchParams.get('debug') ?? ''
	const unit = url.searchParams.get('unit') ?? 'C'
	const lang = url.searchParams.get('lang') ?? 'en'
	const data = url.searchParams.get('data') ?? 'all'
	const query = url.searchParams.get('query') ?? url.searchParams.get('q') ?? ''
	const lat = url.searchParams.get('lat') ?? cf_latitude ?? '0'
	const lon = url.searchParams.get('lon') ?? cf_longitude ?? '0'
	const provider = url.searchParams.get('provider') ?? ''

	const params = sanitizeParams({
		lat,
		lon,
		geo,
		lang,
		unit,
		data,
		query,
		debug,
		provider,
	})

	let body = ''
	let status = 200
	let contentType = 'application/json'
	let cacheControl = 'public, max-age=1800'
	let json: AccuWeather.Weather | Foreca.Weather | undefined = undefined

	if (params.debug === 'content') {
		if (params.provider === 'accuweather') {
			const response = await accuweather.debugContent(params)
			return new Response(JSON.stringify(response), { headers: { 'content-type': 'application/json' } })
		}

		if (params.provider === 'foreca') {
			const response = await foreca.debugContent(params)
			return new Response(JSON.stringify(response), { headers: { 'content-type': 'application/json' } })
		}
	}

	if (params.debug === 'nodes') {
		if (params.provider === 'accuweather') {
			const response = await accuweather.debugNodes(params)
			return new Response(JSON.stringify(response), { headers: { 'content-type': 'application/json' } })
		}

		if (params.provider === 'foreca') {
			const response = await foreca.debugNodes(params)
			return new Response(JSON.stringify(response), { headers: { 'content-type': 'application/json' } })
		}
	}

	if (params.geo && params.provider) {
		let list: unknown[] = []

		if (params.provider === 'accuweather' || params.provider === 'auto') {
			list = await accuweather.geo(params)
		}
		if (params.provider === 'foreca' || (params.provider === 'auto' && list.length === 0)) {
			list = await foreca.geo(params)
		}

		if (params.provider === 'auto' || params.data === 'simple') {
			if (isAccuweatherLocation(list) || isForecaLocation(list)) {
				list = toSimpleLocations(list)
			}
		}

		return new Response(JSON.stringify(list), {
			status,
			headers: {
				'access-control-allow-methods': 'GET',
				'access-control-allow-origin': '*',
				'content-type': contentType,
				'cache-control': cacheControl,
			},
		})
	}

	try {
		if (url.pathname !== '/' && url.pathname !== '/weather') {
			status = 404
			contentType = 'text/plain'
			cacheControl = 'no-cache'
		} //
		else if (!params.query && !params.lat && !params.lon) {
			status = 400
		} //
		else if (params.provider === '') {
			const html = await import('./index.html' as string)
			body = html.default
			contentType = 'text/html'
		} //
		else if (params.provider === 'auto') {
			if (json === undefined) json = await tryNoCatch(accuweather.default, params)
			if (json === undefined) json = await tryNoCatch(foreca.default, params)
		} //
		else if (params.provider === 'accuweather') {
			json = await accuweather.default(params)
		} //
		else if (params.provider === 'foreca') {
			json = await foreca.default(params)
		} //
		else if (params.provider === 'weathercom') {
			json = await weathercom.default(params)
		}

		if (params.data === 'all' && json) {
			body = JSON.stringify(json)
		}

		if (params.data === 'simple' && json) {
			if (isAccuweather(json) || isForeca(json)) {
				body = JSON.stringify(toSimpleWeather(json, params))
			}
		}
	} catch (err) {
		const { message } = err as Error
		status = message === 'Language is not valid' ? 400 : 503
		body = `{"status": ${status}, "error": "${message}"}`
		console.error(err)
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

function sanitizeParams(params: Record<string, string>): QueryParams {
	params.provider = params.provider.toLowerCase()
	params.lang = params.lang.toLowerCase().replace('-', '_')
	params.unit = params.unit.toUpperCase()
	params.data = params.data.toLowerCase()

	let provider: QueryParams['provider'] = ''
	let debug: QueryParams['debug'] = ''
	let lat: QueryParams['lat'] = params.lat
	let lon: QueryParams['lon'] = params.lon
	const geo: QueryParams['geo'] = params.geo || undefined

	if (params.provider === 'auto') {
		params.data = 'simple'
		provider = 'auto'
	} //
	else if (params.provider === 'accuweather') provider = 'accuweather'
	else if (params.provider === 'weathercom') provider = 'weathercom'
	else if (params.provider === 'foreca') provider = 'foreca'
	else provider = ''

	if (params.lang === 'pt') {
		params.lang = 'pt_pt'
	}
	if (params.lang === 'nb') {
		params.lang = 'no'
	}

	if (provider === 'foreca') {
		params.lang = params.lang.slice(0, 2)
	}

	if (params.debug === 'nodes') {
		debug = 'nodes'
	} else if (params.debug === 'geo') {
		debug = 'geo'
	} else if (params.debug === 'content') {
		debug = 'content'
	}

	if (params.query) {
		lat = undefined
		lon = undefined

		if (isEncoded(params.query) === false) {
			params.query = encodeURIComponent(params.query)
		}
	}

	return {
		query: params.query,
		lang: params.lang,
		data: params.data === 'simple' ? 'simple' : 'all',
		unit: params.unit === 'F' ? 'F' : 'C',
		provider: provider,
		debug: debug,
		lat: lat,
		lon: lon,
		geo: geo,
	}
}

function isEncoded(str: string) {
	return typeof str == 'string' && decodeURIComponent(str) !== str
}

async function tryNoCatch<Result>(fn: (_: QueryParams) => Promise<Result>, args: QueryParams): Promise<Result | undefined> {
	try {
		return await fn(args)
	} catch (_) {
		return undefined
	}
}
