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
			url: 'https://accuweather.com' + encodeURI($('.header-city-link').attr('href') ?? ''),
		},
		now: {
			icon: $('.cur-con-weather-card .weather-icon')?.attr('data-src') ?? '',
			temp: $('.CurrentConditions--tempValue--zUBSz')?.text(),
			feels: $('.cur-con-weather-card .real-feel')?.text(),
			description: $('.cur-con-weather-card .phrase')?.text(),
		},
		sun: {
			rise: $('.sunrise-sunset__times-value:nth(0)')?.text(),
			set: $('.sunrise-sunset__times-value:nth(1)')?.text(),
		},
		hourly: new Array(12).fill('').map((_, i) => ({
			time: $(`.hourly-list__list__item-time:nth(${i})`)?.text(),
			temp: $(`.hourly-list__list__item-temp:nth(${i})`)?.text(),
			rain: $(`.hourly-list__list__item-precip:nth(${i})`)?.text(),
		})),
		daily: new Array(10).fill('').map((_, i) => ({
			time: $(`.daily-list-item:nth(${i}) .date p:last-child`)?.text(),
			high: $(`.daily-list-item:nth(${i}) .temp-hi`)?.text(),
			low: $(`.daily-list-item:nth(${i}) .temp-lo`)?.text(),
			day: $(`.daily-list-item:nth(${i}) .phrase p:first-child`)?.text(),
			night: $(`.daily-list-item:nth(${i}) .phrase p:last-child`)?.text(),
			rain: $(`.daily-list-item:nth(${i}) .precip`)?.text(),
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

	const firefoxAndroid = 'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/124.0 Firefox/124.0'
	const path = `https://weather.com/weather/today/l/${placeId}?unit=${params.unit}`
	const htmlResp = await fetch(path, { headers: { 'User-Agent': firefoxAndroid } })
	let html = await htmlResp.text()

	html = html.slice(html.indexOf('</head>'), html.indexOf('</footer>'))

	return html
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
