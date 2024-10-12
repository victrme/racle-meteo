import * as cheerio from 'cheerio/slim'

/** @typedef {import('./accuweather/types').AccuWeather} AccuWeather */
/** @typedef {import('../index').QueryParams} QueryParams */

const ACCUWEATHER_LANGS =
	'en_us, es, fr, da, pt_pt, nl, no, it, de, sv, fi, zh_hk, zh_cn, zh_tw, es_ar, es_mx, sk, ro, cs, hu, pl, ca, pt_br, hi, ru, ar, el, en_gb, ja, ko, tr, fr_ca, he, sl, uk, id, bg, et, kk, lt, lv, mk, ms, tl, sr, th, vi, fa, bn, bs, is, sw, ur, sr_me, uz, az, ta, gu, kn, te, mr, pa, my'

/**
 * @param {QueryParams} params
 * @returns {Promise<AccuWeather>}
 */
export default async function accuweather(params) {
	const html = await fetchPageContent(params)
	const json = transformToJson(html)
	const api = validateJson(json)

	return api
}

/**
 * @param {Record<string, unknown>} json
 * @returns {AccuWeather}
 */
function validateJson(json) {
	let date = new Date()

	const hourly = []
	const daily = []

	// 1. Hourly
	date = new Date()
	date.setMinutes(0)
	date.setSeconds(0)
	date.setMilliseconds(0)

	for (const hour of json.hourly) {
		hourly.push({
			...hour,
			time: date.toISOString(),
			temp: parseInt(hour.temp),
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

	let [riseHour, riseMinute] = json.sun.rise.split(':')
	let [setHour, setMinute] = json.sun.set.split(':')

	riseHour = parseInt(riseHour.replace('AM', '').replace('PM', ''))
	setHour = parseInt(setHour.replace('AM', '').replace('PM', ''))

	if (json.sun.rise.includes('PM')) {
		riseHour = parseInt(riseHour) + 12
	}
	if (json.sun.set.includes('PM')) {
		setHour = parseInt(setHour) + 12
	}

	// 4.
	return {
		now: {
			icon: json.now.icon.replace('/images/weathericons/', '').replace('.svg', ''),
			temp: parseInt(json.now.temp),
			feels: parseInt(json.now.feels.replace('RealFeel®', '')),
			description: json.now.description,
		},
		sun: {
			rise: [riseHour, parseInt(riseMinute)],
			set: [setHour, parseInt(setMinute)],
		},
		hourly: hourly,
		daily: daily,
	}
}

/**
 * @param {string} html
 * @returns {Record<string, unknown>}
 */
function transformToJson(html) {
	const $ = cheerio.load(html)

	return {
		now: {
			icon: $('.cur-con-weather-card .weather-icon')?.attr('data-src'),
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

/**
 * Return accuweather.com HTML page with all the necessery information
 *
 * @param {QueryParams} params
 * @returns {Promise<string>}
 */
async function fetchPageContent(params) {
	let { lat, lon, lang, unit } = params
	lang = lang.replace('-', '_').toLocaleLowerCase()

	if (ACCUWEATHER_LANGS.includes(lang) === false) {
		throw new Error('Language is not valid')
	}

	let text

	const path = `https://www.accuweather.com/${lang}/search-locations?query=${lat},${lon}`
	const firefoxAndroid = 'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/124.0 Firefox/124.0'
	const headers = {
		Accept: 'text/html',
		'Accept-Encoding': 'gzip',
		'Accept-Language': lang,
		'User-Agent': firefoxAndroid,
		Cookie: `awx_user=tp:${unit}|lang:${lang};`,
	}

	if (text === undefined) {
		text = await (await fetch(path, { headers }))?.text()
	}

	if (text === undefined) {
		await new Promise((r) => setTimeout(r, 400))
		text = await (await fetch(path, { headers }))?.text()
	}

	if (text === undefined) {
		throw new Error('Could not connect to accuweather.com')
	}

	text = text.replaceAll('\n', '').replaceAll('\t', '')

	return text
}
