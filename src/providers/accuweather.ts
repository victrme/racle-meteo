import * as cheerio from 'cheerio/slim'

import type { AccuWeather, AccuweatherContent, QueryParams } from '../types.ts'

const ACCUWEATHER_LANGS =
	'en_us, es, fr, da, pt_pt, nl, no, it, de, sv, fi, zh_hk, zh_cn, zh_tw, es_ar, es_mx, sk, ro, cs, hu, pl, ca, pt_br, hi, ru, ar, el, en_gb, ja, ko, tr, fr_ca, hr, sl, uk, id, bg, et, kk, lt, lv, mk, ms, tl, sr, th, vi, fa, bn, bs, is, sw, ur, sr_me, uz, az, ta, gu, kn, te, mr, pa, my'

export default async function accuweather(params: QueryParams): Promise<AccuWeather> {
	const html = await fetchPageContent(params)
	const json = transformToJson(html)
	const api = validateJson(json, params)

	return api
}

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
			city: city.replaceAll('-', ' '),
			country: country.toUpperCase(),
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

function transformToJson(html: string): AccuweatherContent {
	const $ = cheerio.load(html)

	return {
		meta: {
			url: 'https://accuweather.com' + encodeURI($('.header-city-link').attr('href') ?? ''),
		},
		now: {
			icon: $('.cur-con-weather-card .weather-icon')?.attr('data-src') ?? '',
			temp: $('.cur-con-weather-card .temp-container')?.text(),
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
	let { lat, lon, lang, unit, query } = params
	lang = lang.replace('-', '_').toLocaleLowerCase()

	if (ACCUWEATHER_LANGS.includes(lang) === false) {
		throw new Error('Language is not valid')
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
		const autocompleteURL = `https://www.accuweather.com/web-api/autocomplete?query=${query}&language=en-us`
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

	let text = await (await fetch(path, { headers }))?.text()

	if (text === undefined) {
		throw new Error('Could not connect to accuweather.com')
	}

	text = text.replaceAll('\n', '').replaceAll('\t', '')

	return text
}
