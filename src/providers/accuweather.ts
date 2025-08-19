import parser, { find, findAll, getAll } from '../parser.ts'

import type { FlatNode } from '../parser.ts'
import type { AccuWeather, QueryParams } from '../types.ts'

const ACCUWEATHER_LANGS =
	'en_us, es, fr, da, pt_pt, nl, no, it, de, sv, fi, zh_hk, zh_cn, zh_tw, es_ar, es_mx, sk, ro, cs, hu, pl, ca, pt_br, hi, ru, ar, el, en_gb, ja, ko, tr, fr_ca, hr, sl, uk, id, bg, et, kk, lt, lv, mk, ms, tl, sr, th, vi, fa, bn, bs, is, sw, ur, sr_me, uz, az, ta, gu, kn, te, mr, pa, my, he'

export default async function accuweather(params: QueryParams): Promise<AccuWeather.Weather> {
	const html = await fetchPageContent(params)
	await parser(html)

	const json = transformToJson()
	const api = validateJson(json, params)

	return api
}

export async function geo(params: QueryParams): Promise<AccuWeather.Location[]> {
	if (!params.query) {
		if (params.lat && params.lon) {
			throw new Error('Can only get locations from queries')
		}
	}

	return await geolocationFromQuery(params.query)
}

export async function debugContent(params: QueryParams): Promise<AccuWeather.Content> {
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

// Fn

function validateJson(json: AccuWeather.Content, params: QueryParams): AccuWeather.Weather {
	let date = new Date()

	const hourly: AccuWeather.Weather['hourly'] = []
	const daily: AccuWeather.Weather['daily'] = []

	// 1. Hourly
	date = new Date()
	date.setMinutes(0)
	date.setSeconds(0)
	date.setMilliseconds(0)

	for (const hour of json.hourly) {
		hourly.push({
			time: date.toISOString(),
			temp: parseInt(hour.temp),
			rain: hour.rain,
		})

		date.setHours(date.getHours() + 1)
	}

	// 2. Daily
	date = new Date()
	date.setMinutes(0)
	date.setSeconds(0)
	date.setMilliseconds(0)

	for (const day of json.daily) {
		daily.push({
			...day,
			time: date.toISOString(),
			high: parseInt(day.high),
			low: parseInt(day.low),
		})

		date.setDate(date.getDate() + 1)
	}

	// 3. Sun
	date = new Date()
	date.setSeconds(0)
	date.setMilliseconds(0)

	const splitChar = json.sun.rise.includes('.') ? '.' : ':'
	const [riseHour, riseMinute] = json.sun.rise.split(splitChar)
	const [setHour, setMinute] = json.sun.set.split(splitChar)

	let riseHourInt = parseInt(riseHour.replace('AM', '').replace('PM', ''))
	let setHourInt = parseInt(setHour.replace('AM', '').replace('PM', ''))

	if (json.sun.rise.includes('PM')) {
		riseHourInt = parseInt(riseHour.replace('PM', '')) + 12
	}
	if (json.sun.set.includes('PM')) {
		setHourInt = parseInt(setHour.replace('PM', '')) + 12
	}

	// 4. Geo
	const { pathname } = new URL(json.meta.url)
	const [_, __, country, city] = pathname.split('/')
	const geo: AccuWeather.Weather['geo'] = {
		city: decodeURIComponent(city),
		country: decodeURIComponent(country.toUpperCase()),
	}

	if (params.lat) geo.lat = parseFloat(params.lat)
	if (params.lon) geo.lon = parseFloat(params.lon)

	// 5.
	return {
		meta: {
			url: json.meta.url,
			lang: params.lang,
			provider: 'accuweather',
		},
		geo: geo,
		now: {
			icon: json.now.icon.replace('/images/weathericons/', '').replace('.svg', ''),
			temp: parseInt(json.now.temp),
			feels: parseInt(json.now.feels.replace('RealFeel®', '')),
			description: json.now.description,
		},
		sun: {
			rise: [riseHourInt, parseInt(riseMinute)],
			set: [setHourInt, parseInt(setMinute)],
		},
		hourly: hourly,
		daily: daily,
	}
}

function transformToJson(): AccuWeather.Content {
	const sun = findAll('sunrise-sunset__times-value')

	const daily = {
		temp: findAll(`hourly-list__list__item-temp`),
		rain: findAll(`hourly-list__list__item-temp`),
	}

	const hourly = {
		high: findAll(`temp-hi`),
		low: findAll(`temp-lo`),
		day: findAll(`no-wrap`),
		night: findAll(`no-wrap`),
		rain: findAll(``),
	}

	const result = {
		meta: {
			url: 'https://accuweather.com' + (find('header-loc')?.attr?.href ?? ''),
		},
		now: {
			icon: find('header-weather-icon')?.attr?.['data-src'] ?? '',
			temp: find('after-temp')?.text,
			feels: find('real-feel')?.text,
			description: find('phrase')?.text,
		},
		sun: {
			rise: sun[0]?.text,
			set: sun[1]?.text,
		},
		hourly: new Array(12).fill('').map((_, i) => ({
			temp: daily.temp[i]?.text,
			rain: '0%',
		})),
		daily: new Array(10).fill('').map((_, i) => ({
			high: hourly.high[i]?.text,
			low: hourly.low[i]?.text,
			day: hourly.day[i]?.text,
			night: hourly.night[i]?.text,
			rain: '0%',
		})),
	}

	return result
}

async function fetchPageContent(params: QueryParams): Promise<string> {
	let { lat, lon, lang, unit, query } = params
	lang = lang.replace('-', '_').toLocaleLowerCase()

	if (ACCUWEATHER_LANGS.includes(lang) === false) {
		lang = 'en'
	}

	let path = 'https://www.accuweather.com/'

	const headers = {
		Accept: 'text/html',
		'Accept-Encoding': 'gzip',
		'Accept-Language': lang,
		'User-Agent': 'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/124.0 Firefox/124.0',
		Cookie: `awx_user=tp:${unit}|lang:${lang};`,
	}

	if (query) {
		const geo = await geolocationFromQuery(params.query)
		path += `web-api/three-day-redirect?key=${geo[0].key}`
	} else {
		path += `${lang}/search-locations?query=${lat},${lon}`
	}

	console.log(path)

	let html = await (await fetch(path, { headers }))?.text()

	if (html === undefined) {
		throw new Error('Could not connect to accuweather.com')
	}

	html = html.replaceAll('\n', '').replaceAll('\t', '')
	html = html.slice(html.indexOf('</head>'))

	return html
}

async function geolocationFromQuery(query: string): Promise<AccuWeather.Location[]> {
	const headers = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
		Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
		'Accept-Encoding': 'gzip, deflate, br, zstd',
		'Accept-Language': 'en-US',
		cookie: '',
	}

	const path = `https://www.accuweather.com/web-api/autocomplete?query=${query}&language=en-us&r=${Date.now()}`
	const resp = await fetch(path, { headers })
	const result = (await resp?.json()) as AccuWeather.Location[]

	if (result.length > 0) {
		return result
	} else {
		throw new Error('Location is empty')
	}
}
