import parser, { find, findAll } from '../parser.ts'

import type { FlatNode } from '../parser.ts'
import type { AccuWeather, AccuweatherContent, QueryParams } from '../types.ts'

const ACCUWEATHER_LANGS =
	'en_us, es, fr, da, pt_pt, nl, no, it, de, sv, fi, zh_hk, zh_cn, zh_tw, es_ar, es_mx, sk, ro, cs, hu, pl, ca, pt_br, hi, ru, ar, el, en_gb, ja, ko, tr, fr_ca, hr, sl, uk, id, bg, et, kk, lt, lv, mk, ms, tl, sr, th, vi, fa, bn, bs, is, sw, ur, sr_me, uz, az, ta, gu, kn, te, mr, pa, my'

export default async function accuweather(params: QueryParams): Promise<AccuWeather> {
	const html = await fetchPageContent(params)
	const _ = await parser(html)
	const json = transformToJson()
	const api = validateJson(json, params)

	return api
}

export async function debugContent(params: QueryParams): Promise<AccuweatherContent> {
	const html = await fetchPageContent(params)
	const _ = await parser(html)
	const json = transformToJson()

	return json
}

export async function debugNodes(params: QueryParams): Promise<FlatNode[]> {
	const html = await fetchPageContent(params)

	const start = performance.now()
	const nodes = await parser(html)
	const end = performance.now()

	console.log(end - start)

	return nodes
}

// Fn

function validateJson(json: AccuweatherContent, params: QueryParams): AccuWeather {
	let date = new Date()

	const hourly: AccuWeather['hourly'] = []
	const daily: AccuWeather['daily'] = []

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

	const [riseHour, riseMinute] = json.sun.rise.split(':')
	const [setHour, setMinute] = json.sun.set.split(':')

	let riseHourInt = parseInt(riseHour.replace('AM', '').replace('PM', ''))
	let setHourInt = parseInt(setHour.replace('AM', '').replace('PM', ''))

	if (json.sun.rise.includes('PM')) {
		riseHourInt = parseInt(riseHour) + 12
	}
	if (json.sun.set.includes('PM')) {
		setHourInt = parseInt(setHour) + 12
	}

	// 4.
	const { pathname } = new URL(json.meta.url)
	const [_, __, country, city] = pathname.split('/')

	// 5.
	return {
		meta: {
			url: json.meta.url,
			lang: params.lang,
			provider: 'accuweather',
		},
		geo: {
			lat: parseFloat(params.lat),
			lon: parseFloat(params.lon),
			city: decodeURIComponent(city),
			country: decodeURIComponent(country.toUpperCase()),
		},
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

function transformToJson(): AccuweatherContent {
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
			icon: find('weather-icon')?.attr?.['data-src'] ?? '',
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
		const q = encodeURIComponent(query)
		const autocompleteURL = `https://www.accuweather.com/web-api/autocomplete?query=${q}&language=en-us`
		const autocompleteHeaders = {
			...headers,
			cookie: `awx_user=tp:C|lang:en-US;`,
		}
		const autocompleteResponse = await fetch(autocompleteURL, {
			headers: autocompleteHeaders,
		})

		const autocompleteResult = await autocompleteResponse?.json()
		const key = autocompleteResult[0]?.key

		path += `web-api/three-day-redirect?key=${key}`
	} else {
		path += `${lang}/search-locations?query=${lat},${lon}`
	}

	let html = await (await fetch(path, { headers }))?.text()

	if (html === undefined) {
		throw new Error('Could not connect to accuweather.com')
	}

	html = html.replaceAll('\n', '').replaceAll('\t', '')
	html = html.slice(html.indexOf('</head>'))

	return html
}
