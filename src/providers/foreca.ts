import parser, { find, findAll, getAll, next, prev, prevAll } from '../parser.ts'

import type { FlatNode } from '../parser.ts'
import type { Foreca, ForecaContent, ForecaGeo, QueryParams } from '../types.ts'

const FORECA_LANGS = 'en, bg, cs, da, de, et, el, es, fr, hr, it, lv, hu, nl, pl, pt, ro, ru, sk, sv, uk'

let pageURL = ''
let foundCity = ''
let foundCountry = ''

export default async function foreca(params: QueryParams): Promise<Foreca> {
	const html = await fetchPageContent(params)
	await parser(html)

	const json = transformToJson()
	const api = validateJson(json, params)

	return api
}

export async function debugContent(params: QueryParams): Promise<ForecaContent> {
	const html = await fetchPageContent(params)
	await parser(html)

	return transformToJson()
}

export async function debugNodes(params: QueryParams): Promise<FlatNode[]> {
	const html = await fetchPageContent(params)

	const start = performance.now()
	await parser(html)
	const end = performance.now()

	console.log(end - start)

	return getAll()
}

// fn

function validateJson(json: ForecaContent, params: QueryParams): Foreca {
	const [riseHour, riseMinutes] = json.sun.rise?.split(':')
	const [setHour, setMinutes] = json.sun.set?.split(':')

	const date = new Date()
	date.setMinutes(0)
	date.setSeconds(0)
	date.setMilliseconds(0)

	return {
		meta: {
			url: pageURL,
			lang: params.lang,
			provider: 'foreca',
		},
		geo: {
			lat: params.lat ? parseFloat(params.lat) : undefined,
			lon: params.lon ? parseFloat(params.lon) : undefined,
			city: foundCity,
			country: foundCountry.toUpperCase(),
		},
		now: {
			icon: json.now.icon.replace('/public/images/symbols/', '').replace('.svg', ''),
			description: json.now.description,
			humid: json.now.humid + '%',
			temp: {
				c: parseInt(json.now.temp.c),
				f: parseInt(json.now.temp.f),
			},
			feels: {
				c: parseInt(json.now.feels.c),
				f: parseInt(json.now.feels.f),
			},
			wind: {
				kmh: parseInt(json.now.wind.kmh),
				mph: parseInt(json.now.wind.mph),
			},
		},
		sun: {
			rise: [parseInt(riseHour), parseInt(riseMinutes)],
			set: [parseInt(setHour), parseInt(setMinutes)],
		},
		daily: json.daily.map((day) => {
			const time = date.toISOString()
			date.setDate(date.getDate() + 1)

			return {
				time,
				low: {
					c: parseInt(day.low.c),
					f: parseInt(day.low.f),
				},
				high: {
					c: parseInt(day.high.c),
					f: parseInt(day.high.f),
				},
				wind: {
					kmh: parseInt(day.wind.kmh),
					mph: parseInt(day.wind.mph),
				},
				rain: {
					in: parseFloat(day.rain.in),
					mm: parseFloat(day.rain.mm),
				},
			}
		}),
	}
}

function transformToJson(): ForecaContent {
	const [sunrise, sunset] = findAll('value time time_24h')

	const daily = {
		high_c: prevAll('value wind wind_mph', 6),
		high_f: prevAll('value wind wind_mph', 5),
		low_c: prevAll('value wind wind_mph', 4),
		low_f: prevAll('value wind wind_mph', 3),
		wind_mph: prevAll('value wind wind_mph', 1),
		wind_kmh: prevAll('value wind wind_kmh', 1),
		rain_in: findAll('value rain rain_in'),
		rain_mm: findAll('value rain rain_mm'),
	}

	return {
		now: {
			temp: {
				c: find('value temp temp_c')?.text,
				f: find('value temp temp_f')?.text,
			},
			feels: {
				c: next('value temp temp_f', 1)?.text,
				f: next('value temp temp_f', 2)?.text,
			},
			wind: {
				kmh: find('value wind wind_kmh')?.text,
				mph: find('value wind wind_mph')?.text,
			},
			icon: prev('value wind wind_ms', 2).attr?.src ?? '',
			description: find('row wx')?.text,
			humid: next('row wx', 4)?.text,
		},
		sun: {
			rise: sunrise?.text,
			set: sunset?.text,
		},
		daily: new Array(5).fill('').map((_, i) => ({
			high: {
				c: daily.high_c[i + 1]?.text,
				f: daily.high_f[i + 1]?.text,
			},
			low: {
				c: daily.low_c[i + 1]?.text,
				f: daily.low_f[i + 1]?.text,
			},
			wind: {
				mph: daily.wind_mph[i + 1]?.text,
				kmh: daily.wind_kmh[i + 1]?.text,
			},
			rain: {
				in: daily.rain_in[i]?.text,
				mm: daily.rain_mm[i]?.text,
			},
		})),
	}
}

export async function fetchPageContent({ lat, lon, query, lang, unit }: QueryParams): Promise<string> {
	if (FORECA_LANGS.includes(lang) === false) {
		lang = 'en'
	}

	const { id, defaultName, countryId } = await getForecaLocation({
		lat,
		lon,
		query,
	})

	if (!id || !defaultName) {
		throw new Error('Cannot get foreca ID or name')
	}

	const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0'
	const cookies =
		`fcaId=${id}; fcai18n=${lang}; fcaSettings-v2={"units":{"temp":"${unit}","wind":"kmh","rain":"mm","pres":"hPa","vis":"km"},"time":"24h","theme":"dark","language":"${lang}"};`

	pageURL = `https://www.foreca.com/${lang}/${id}/${defaultName}`
	foundCity = defaultName
	foundCountry = countryId

	const resp = await fetch(pageURL, {
		headers: {
			Accept: 'text/html',
			'Accept-Encoding': 'gzip',
			'Accept-Language': 'en',
			'User-Agent': userAgent,
			Cookie: cookies,
		},
	})

	const html = await resp.text()

	return html.slice(html.indexOf('</head>'))
}

export async function getForecaLocation({ lat, lon, query }: Partial<QueryParams>): Promise<ForecaGeo> {
	if (query) {
		const path = `https://api.foreca.net/locations/search/${query}.json`
		const resp = await fetch(path)
		const json = await resp.json()
		return json.results[0]
	} else {
		const path = `https://api.foreca.net/locations/${lon},${lat}.json`
		const resp = await fetch(path)
		const json = await resp.json()
		return json
	}
}

// export async function getForecaData(lat, lon) {
// 	const { id } = await getForecaLocation(lat, lon)
// 	const resp = await fetch(`https://api.foreca.net/data/favorites/${id}.json`)
// 	return await resp.json()
// }
