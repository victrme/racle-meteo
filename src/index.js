import * as accuweather from './providers/accuweather'
import * as foreca from './providers/foreca'
import striptags from 'striptags'

export default { fetch: main }

async function main(request) {
	const url = new URL(request.url)
	const unit = url.searchParams.get('unit') ?? 'C'
	const lang = url.searchParams.get('lang') ?? 'en'
	const lat = url.searchParams.get('lat') ?? request.cf.latitude
	const lon = url.searchParams.get('lon') ?? request.cf.longitude

	const html = await accuweather.getWeatherHTML(lat, lon, lang, unit)
	const json = accuweather.parseContent(html)
	const result = { lat, lon, ...json }

	const headers = {
		'access-control-allow-methods': 'GET',
		'access-control-allow-origin': '*',
		'content-type': 'application/json',
		'cache-control': 'public, max-age=1800',
	}

	return new Response(JSON.stringify(result), { headers })
}

// Parse
