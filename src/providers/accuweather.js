import * as cheerio from 'cheerio/slim'

/** @typedef {import('../types').AccuWeather} AccuWeather */

/**
 * @param {number} lat - Latitude coordinates
 * @param {number} lon - Longitude coordinates
 * @param {string} lang - Content language, "en" by default
 * @param {"C" | "F"} unit - Either celsius or football fields
 * @returns {Promise<AccuWeather>}
 */
export default async function accuweather(lat, lon, lang, unit) {
	const html = await fetchPageContent(lat, lon, lang, unit)
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
			icon: parseInt(json.now.icon.replace('/images/weathericons/', '').replace('.svg', '')),
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
 * @param {number} lat - Latitude coordinates
 * @param {number} lon - Longitude coordinates
 * @param {string} lang - Content language, "en" by default
 * @param {"C" | "F"} unit - Either celsius or football fields
 * @returns {Promise<string>}
 */
async function fetchPageContent(lat, lon, lang, unit) {
	lang = lang.replace('-', '_').toLocaleLowerCase()

	if (VALID_LANGUAGES.includes(lang) === false) {
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

const VALID_LANGUAGES =
	'en_us, es, fr, da, pt_pt, nl, no, it, de, sv, fi, zh_hk, zh_cn, zh_tw, es_ar, es_mx, sk, ro, cs, hu, pl, ca, pt_br, hi, ru, ar, el, en_gb, ja, ko, tr, fr_ca, he, sl, uk, id, bg, et, kk, lt, lv, mk, ms, tl, sr, th, vi, fa, bn, bs, is, sw, ur, sr_me, uz, az, ta, gu, kn, te, mr, pa, my'

const ACCUWEATHER_ICONS = [
	{
		name: '1',
		text: 'Sunny',
		day: 'Yes',
		night: 'No',
	},
	{
		name: '2',
		text: 'Mostly Sunny',
		day: 'Yes',
		night: 'No',
	},
	{
		name: '3',
		text: 'Partly Sunny',
		day: 'Yes',
		night: 'No',
	},
	{
		name: '4',
		text: 'Intermittent Clouds',
		day: 'Yes',
		night: 'No',
	},
	{
		name: '5',
		text: 'Hazy Sunshine',
		day: 'Yes',
		night: 'No',
	},
	{
		name: '6',
		text: 'Mostly Cloudy',
		day: 'Yes',
		night: 'No',
	},
	{
		name: '7',
		text: 'Cloudy',
		day: 'Yes',
		night: 'Yes',
	},
	{
		name: '8',
		text: 'Dreary (Overcast)',
		day: 'Yes',
		night: 'Yes',
	},
	{
		name: '11',
		text: 'Fog',
		day: 'Yes',
		night: 'Yes',
	},
	{
		name: '12',
		text: 'Showers',
		day: 'Yes',
		night: 'Yes',
	},
	{
		name: '13',
		text: 'Mostly Cloudy w/ Showers',
		day: 'Yes',
		night: 'No',
	},
	{
		name: '14',
		text: 'Partly Sunny w/ Showers',
		day: 'Yes',
		night: 'No',
	},
	{
		name: '15',
		text: 'T-Storms',
		day: 'Yes',
		night: 'Yes',
	},
	{
		name: '16',
		text: 'Mostly Cloudy w/ T-Storms',
		day: 'Yes',
		night: 'No',
	},
	{
		name: '17',
		text: 'Partly Sunny w/ T-Storms',
		day: 'Yes',
		night: 'No',
	},
	{
		name: '18',
		text: 'Rain',
		day: 'Yes',
		night: 'Yes',
	},
	{
		name: '19',
		text: 'Flurries',
		day: 'Yes',
		night: 'Yes',
	},
	{
		name: '20',
		text: 'Mostly Cloudy w/ Flurries',
		day: 'Yes',
		night: 'No',
	},
	{
		name: '21',
		text: 'Partly Sunny w/ Flurries',
		day: 'Yes',
		night: 'No',
	},
	{
		name: '22',
		text: 'Snow',
		day: 'Yes',
		night: 'Yes',
	},
	{
		name: '23',
		text: 'Mostly Cloudy w/ Snow',
		day: 'Yes',
		night: 'No',
	},
	{
		name: '24',
		text: 'Ice',
		day: 'Yes',
		night: 'Yes',
	},
	{
		name: '25',
		text: 'Sleet',
		day: 'Yes',
		night: 'Yes',
	},
	{
		name: '26',
		text: 'Freezing Rain',
		day: 'Yes',
		night: 'Yes',
	},
	{
		name: '29',
		text: 'Rain and Snow',
		day: 'Yes',
		night: 'Yes',
	},
	{
		name: '30',
		text: 'Hot',
		day: 'Yes',
		night: 'Yes',
	},
	{
		name: '31',
		text: 'Cold',
		day: 'Yes',
		night: 'Yes',
	},
	{
		name: '32',
		text: 'Windy',
		day: 'Yes',
		night: 'Yes',
	},
	{
		name: '33',
		text: 'Clear',
		day: 'No',
		night: 'Yes',
	},
	{
		name: '34',
		text: 'Mostly Clear',
		day: 'No',
		night: 'Yes',
	},
	{
		name: '35',
		text: 'Partly Cloudy',
		day: 'No',
		night: 'Yes',
	},
	{
		name: '36',
		text: 'Intermittent Clouds',
		day: 'No',
		night: 'Yes',
	},
	{
		name: '37',
		text: 'Hazy Moonlight',
		day: 'No',
		night: 'Yes',
	},
	{
		name: '38',
		text: 'Mostly Cloudy',
		day: 'No',
		night: 'Yes',
	},
	{
		name: '39',
		text: 'Partly Cloudy w/ Showers',
		day: 'No',
		night: 'Yes',
	},
	{
		name: '40',
		text: 'Mostly Cloudy w/ Showers',
		day: 'No',
		night: 'Yes',
	},
	{
		name: '41',
		text: 'Partly Cloudy w/ T-Storms',
		day: 'No',
		night: 'Yes',
	},
	{
		name: '42',
		text: 'Mostly Cloudy w/ T-Storms',
		day: 'No',
		night: 'Yes',
	},
	{
		name: '43',
		text: 'Mostly Cloudy w/ Flurries',
		day: 'No',
		night: 'Yes',
	},
	{
		name: '44',
		text: 'Mostly Cloudy w/ Snow',
		day: 'No',
		night: 'Yes',
	},
]
