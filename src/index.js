import { htmlContentToStringArray } from './providers/shared'
import * as accuweather from './providers/accuweather'
import * as foreca from './providers/foreca'

export default { fetch: main }

async function main(request) {
	const url = new URL(request.url)
	const unit = url.searchParams.get('unit') ?? 'C'
	const lang = url.searchParams.get('lang') ?? 'en'
	const lat = url.searchParams.get('lat') ?? request.cf.latitude
	const lon = url.searchParams.get('lon') ?? request.cf.longitude

	let result

	const headers = {
		'access-control-allow-methods': 'GET',
		'access-control-allow-origin': '*',
		'content-type': 'application/json',
		'cache-control': 'public, max-age=1800',
	}

	switch (url.pathname) {
		case '/foreca/api':
			const json = await foreca.getForecaData(lat, lon)
			result = { lat, lon, ...json }
			break

		case '/foreca':
		case '/foreca/':
		case '/foreca/web': {
			const html = await foreca.getWeatherHTML(lat, lon, lang, unit)
			const json = foreca.parseContent(html)
			result = { lat, lon, ...json }
			break
		}

		case '/foreca/raw': {
			const html = await foreca.getWeatherHTML(lat, lon, lang, unit)
			result = htmlContentToStringArray(
				html,
				html.indexOf('<body'),
				html.lastIndexOf('</body')
			)
			break
		}

		case '/accuweather/raw': {
			const html = await accuweather.getWeatherHTML(lat, lon, lang, unit)
			result = htmlContentToStringArray(
				html,
				html.indexOf('<body'),
				html.lastIndexOf('</body')
			)
			break
		}

		case '/accuweather/list': {
			const html = await accuweather.getWeatherHTML(lat, lon, lang, unit)
			result = accuweather.parseContentWithList(html)
			break
		}

		case '/accuweather':
		case '/accuweather/':
		case '/accuweather/web': {
			const html = await accuweather.getWeatherHTML(lat, lon, lang, unit)
			const json = accuweather.parseContent(html)
			result = { lat, lon, ...json }
			break
		}

		default:
			break
	}

	return new Response(JSON.stringify(result), { headers })
}
