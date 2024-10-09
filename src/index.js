import index from './index.html'
import foreca from './providers/foreca.js'
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
