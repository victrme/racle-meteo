import * as cheerio from 'cheerio/slim'

import type { QueryParams } from '../types.ts'

export default async function weathercom(params: QueryParams) {
	const html = await fetchPageContent(params)
	const json = transformToJson(html)
	const api = validateJson(json, params)

	return api
}

function validateJson(json: unknown, params: QueryParams): undefined {
	console.log(json)
	// ...
}

function transformToJson(html: string): unknown {
	const $ = cheerio.load(html)

	return {
		meta: {
			url: 'https://weather.com' + encodeURI($('.header-city-link').attr('href') ?? ''),
		},
		now: {
			icon: $('.CurrentConditions--wxIcon--BOjPq')?.attr('skycode') ?? '',
			temp: $('.CurrentConditions--tempValue--zUBSz')?.text(),
			feels: $('.TodayDetailsCard--feelsLikeTempValue--8WgHV')?.text(),
			description: $('.CurrentConditions--phraseValue---VS-k')?.text(),
		},
		sun: {
			rise: $('.TwcSunChart--sunriseDateItem--Os-KL')?.text(),
			set: $('.TwcSunChart--sunsetDateItem--y9wq2')?.text(),
		},
		daily: new Array(10).fill('').map((_, i) => ({
			description: $(`.DailyForecast--CardContent--y6e2w .DailyContent--narrative--jqi6P:nth(${i})`)?.text(),
			high: $(`.DailyForecast--CardContent--y6e2w .DetailsSummary--highTempValue--VHKaO:nth(${i})`)?.text(),
			low: $(`.DailyForecast--CardContent--y6e2w .DetailsSummary--lowTempValue--ogrzb:nth(${i})`)?.text(),
			rain: $(`.DailyForecast--CardContent--y6e2w .DetailsSummary--precip--YXw9t:nth(${i})`)?.text(),
		})),
	}
}

async function fetchPageContent(params: QueryParams): Promise<string> {
	const query = params.query ? params.query : `${params.lat}, ${params.lon}`

	const post = [
		{
			name: 'getSunV3LocationSearchUrlConfig',
			params: {
				query: query,
				language: 'en-US',
				locationType: 'locale',
			},
		},
	]

	const locationResp = await fetch('https://weather.com/api/v1/p/redux-dal', {
		method: 'POST',
		body: JSON.stringify(post),
		headers: {
			'content-type': 'application/json',
		},
	})

	if (locationResp.status !== 200) {
		throw 'Cannot get weather.com API, code: ' + locationResp.status
	}

	const json = (await locationResp.json()) as WeatherComLocationSearch
	const data = Object.values(json.dal.getSunV3LocationSearchUrlConfig)[0].data
	const placeId = data.location.placeId[0]

	const headers = {
		'User-Agent': 'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/124.0 Firefox/124.0',
	}

	const responses = await Promise.all([
		fetch(`https://weather.com/${params.lang}/weather/today/l/${placeId}?unit=${params.unit}`, { headers }),
		fetch(`https://weather.com/${params.lang}/weather/tenday/l/${placeId}?unit=${params.unit}`, { headers }),
	])

	let today = await responses[0].text()
	let tenday = await responses[1].text()

	today = today.slice(today.indexOf('</head>'), today.indexOf('</footer>'))
	tenday = tenday.slice(tenday.indexOf('</head>'), tenday.indexOf('</footer>'))

	return today + tenday
}

interface WeatherComLocationSearch {
	dal: {
		getSunV3LocationSearchUrlConfig: {
			[key: string]: {
				loading: false
				loaded: true
				data: {
					location: {
						city: string[]
						countryCode: string[]
						displayName: string[]
						latitude: number[]
						locale: {
							locale1: string | null
							locale2: string | null
							locale3: string | null
							locale4: string | null
						}[]
						longitude: number[]
						placeId: string[]
						type: string[]
					}
				}
			}
		}
	}
}
