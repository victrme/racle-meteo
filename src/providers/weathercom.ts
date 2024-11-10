import parser, { find } from '../parser.ts'
import type { QueryParams } from '../types.ts'

export default async function weathercom(params: QueryParams) {
	const html = await fetchPageContent(params)
	await parser(html)

	const json = transformToJson(html)
	const api = validateJson(json, params)

	return api
}

function validateJson(json: unknown, params: QueryParams): undefined {
	// ...
	console.log(json)
}

function transformToJson(html: string): unknown {
	return {
		meta: {
			url: find('a.styles--weatherData--Tl3Lx').attr?.href ?? '',
		},
		now: {
			icon: find('.CurrentConditions--wxIcon--BOjPq').attr?.skycode ?? '',
			temp: find('.current-temp')?.text,
			feels: find('.TodayDetailsCard--feelsLikeTempValue--8WgHV')?.text,
			description: find('.CurrentConditions--phraseValue---VS-k')?.text,
		},
		sun: {
			rise: find('.TwcSunChart--sunriseDateItem--Os-KL')?.text,
			set: find('.TwcSunChart--sunsetDateItem--y9wq2')?.text,
		},
		daily: new Array(10).fill('').map((_, __) => ({
			description: find(`.DailyForecast--CardContent--y6e2w .DailyContent--narrative--jqi6P:nth(find{i})`)?.text,
			high: find(`.DailyForecast--CardContent--y6e2w .DetailsSummary--highTempValue--VHKaO:nth(find{i})`)?.text,
			low: find(`.DailyForecast--CardContent--y6e2w .DetailsSummary--lowTempValue--ogrzb:nth(find{i})`)?.text,
			rain: find(`.DailyForecast--CardContent--y6e2w .DetailsSummary--precip--YXw9t:nth(find{i})`)?.text,
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
	const countryCode = data.location.countryCode[0].toLowerCase()
	const city = data.location.city[0].toLowerCase()

	const headers = {
		'Content-Security-Policy': 'sandbox',
		'User-Agent': 'Opera/9.80 (J2ME/MIDP; Opera Mini/SymbianOS/22.478; U; en) Presto/2.5.25 Version/10.54',
	}

	const url = `https://www.wunderground.com/weather/${countryCode}/${city}`
	const resp = await fetch(url, { headers })
	const html = await resp.text()

	return html.slice(html.indexOf('<app-root'), html.indexOf('</app-root>') + 11)
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
