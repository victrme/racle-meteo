import * as htmlparser2 from 'htmlparser2'
import * as cheerio from 'cheerio/slim'

/**
 * @param {number} lat - Latitude coordinates
 * @param {number} lon - Longitude coordinates
 * @param {string} lang - Content language, "en" by default
 * @param {"C" | "F"} unit - Either celsius or football fields
 * @returns {Promise<AccuWeather>}
 */
export default async function accuweather(lat, lon, lang, unit) {
	const html = await fetcherWeatherHtml(lat, lon, lang, unit)
	const json = weatherHtmlToJson(html)
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

	riseHour = riseHour.replace('AM', '').replace('PM', '')
	setHour = setHour.replace('AM', '').replace('PM', '')

	if (json.sun.rise.includes('PM')) {
		riseHour = (parseInt(riseHour) + 12).toString()
	}
	if (json.sun.set.includes('PM')) {
		setHour = (parseInt(setHour) + 12).toString()
	}

	date.setHours(parseInt(riseHour))
	date.setMinutes(parseInt(riseMinute))
	const rise = date.toISOString()

	date.setHours(parseInt(setHour))
	date.setMinutes(parseInt(setMinute))
	const set = date.toISOString()

	// 4.
	return {
		now: {
			icon: parseInt(json.now.icon.replace('/images/weathericons/', '').replace('.svg', '')),
			temp: parseInt(json.now.temp),
			feels: parseInt(json.now.feels.replace('RealFeel®', '')),
			description: json.now.description,
		},
		hourly: hourly,
		daily: daily,
		sun: {
			rise: rise,
			set: set,
		},
	}
}

/**
 * @param {string} html
 * @returns {Record<string, unknown>}
 */
function weatherHtmlToJson(html) {
	const dom = htmlparser2.parseDocument(html)
	const $ = cheerio.load(dom)

	const now_icon = $('.cur-con-weather-card .weather-icon')?.attr('data-src')
	const now_temp = $('.cur-con-weather-card .temp-container')?.text()
	const now_feels = $('.cur-con-weather-card .real-feel')?.text()
	const now_description = $('.cur-con-weather-card .phrase')?.text()

	const sun_rise = $('.sunrise-sunset__times-value:nth(0)')?.text()
	const sun_set = $('.sunrise-sunset__times-value:nth(1)')?.text()

	const hourly = new Array(12).fill('').map((_, i) => {
		const hourly_time = $(`.hourly-list__list__item-time:nth(${i})`)?.text()
		const hourly_temp = $(`.hourly-list__list__item-temp:nth(${i})`)?.text()
		const hourly_rain = $(`.hourly-list__list__item-precip:nth(${i})`)?.text()

		return {
			time: hourly_time,
			temp: hourly_temp,
			rain: hourly_rain,
		}
	})

	const daily = new Array(10).fill('').map((_, i) => {
		const daily_time = $(`.daily-list-item:nth(${i}) .date p:last-child`)?.text()
		const daily_max = $(`.daily-list-item:nth(${i}) .temp-hi`)?.text()
		const daily_low = $(`.daily-list-item:nth(${i}) .temp-lo`)?.text()
		const daily_day = $(`.daily-list-item:nth(${i}) .phrase p:first-child`)?.text()
		const daily_night = $(`.daily-list-item:nth(${i}) .phrase p:last-child`)?.text()
		const daily_rain = $(`.daily-list-item:nth(${i}) .precip`)?.text()

		return {
			time: daily_time,
			high: daily_max,
			low: daily_low,
			day: daily_day,
			night: daily_night,
			rain: daily_rain,
		}
	})

	return {
		now: {
			icon: now_icon,
			temp: now_temp,
			feels: now_feels,
			description: now_description,
		},
		sun: {
			rise: sun_rise,
			set: sun_set,
		},
		hourly: hourly,
		daily: daily,
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
async function fetcherWeatherHtml(lat, lon, lang, unit) {
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

/**
 * @typedef {Object} AccuWeather
 * @prop {Now} now - Current weather information, with felt temperature
 * @prop {Sun} sun - Current day sun time information
 * @prop {Hourly[]} hourly - 12 hours of hourly forecasted temperature and rain
 * @prop {Daily[]} daily - 10 days of daily forecast
 */

/**
 * @typedef {Object} Now
 * @prop {number} icon - Icon ID, more here: https://developer.accuweather.com/weather-icons
 * @prop {number} temp - Classic temperature
 * @prop {number} feels - Felt temperature, using RealFeel® tech
 * @prop {string} description - Short weather description
 */

/**
 * @typedef {Object} Hourly
 * @prop {number} time - ISO date
 * @prop {number} temp - Classic temperature
 * @prop {string} rain - Percent chance of rain
 */

/**
 * @typedef {Object} Daily
 * @prop {number} time - ISO date
 * @prop {number} high - Highest temperature this day
 * @prop {number} low - Lowest temperature this day
 * @prop {string} day - Weather description for the day
 * @prop {string} night - Weather description for the night
 * @prop {string} rain - Percent chance of rain
 */

/**
 * @typedef {Object} Sun
 * @prop {number} rise - Sunrise timestamp today
 * @prop {number} set - Sunset timestamp today
 */
