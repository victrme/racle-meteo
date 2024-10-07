import { htmlContentToStringArray, locateNumbers } from '../index.js'
import { decode } from 'html-entities'

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

	// console.log(html)
	// console.log(json)
	// console.log(api)

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
			timestamp: date.toISOString(),
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
			timestamp: date.toISOString(),
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
			icon: parseInt(json.now.icon),
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

/** @param {string[]} list */
function removeEnglishOnlyContent(list) {
	list = list.filter(
		(el) =>
			el !== 'Thank you for your patience as we work to get everything up and running again.'
	)

	return list
}

/**
 * @param {string} html
 * @returns {Record<string, unknown>}
 */
function weatherHtmlToJson(html) {
	const listStart = html.indexOf('<a class="cur-con-weather-card')
	const listEnd = html.lastIndexOf('</body')
	const list = removeEnglishOnlyContent(htmlContentToStringArray(html, listStart, listEnd))

	const iconMatch = '/images/weathericons/'
	const iconStart = html.indexOf(iconMatch) + iconMatch.length
	const iconEnd = html.indexOf('.svg', iconStart)
	const icon = html.slice(iconStart, iconEnd)[0]

	const hourlyStart = list.indexOf('Chevron left') + 1
	const dailyStart = list.indexOf('Chevron right') + 3
	const hourly = []
	const daily = []
	let count = 0

	const sunStart = dailyStart + 10 * 7 + 2
	const rise = list[sunStart]
	const set = list[sunStart + 2]

	// <!> Do not remove these, very useful
	// console.log(list)
	// console.log(locateNumbers(list))

	while (count < 10) {
		const index = hourlyStart + count * 3
		const timestamp = list[index]
		const temp = list[index + 1]
		const rain = list[index + 2]
		count++

		hourly.push({ timestamp, temp, rain })
	}

	count = 0

	while (count < 10) {
		const index = dailyStart + count * 7
		const timestamp = list[index]
		const high = list[index + 1]
		const low = list[index + 2]
		const day = list[index + 3]
		const night = list[index + 4]
		const rain = list[index + 5]
		count++

		daily.push({ timestamp, high, low, day, night, rain })
	}

	return {
		now: {
			icon: icon,
			temp: list[2],
			feels: list[5],
			description: list[4],
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
 * Return accuweather.com HTML page with all the necessery information
 *
 * @param {number} lat - Latitude coordinates
 * @param {number} lon - Longitude coordinates
 * @param {string} lang - Content language, "en" by default
 * @param {"C" | "F"} unit - Either celsius or football fields
 * @returns {Promise<string>}
 */
async function fetcherWeatherHtml(lat, lon, lang, unit) {
	const path = `https://www.accuweather.com/${lang}/search-locations?query=${lat},${lon}`
	const firefoxAndroid = 'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/124.0 Firefox/124.0'

	lang = lang.replace('-', '_').toLocaleLowerCase()

	if (VALID_LANGUAGES.includes(lang) === false) {
		throw new Error('Language is not valid')
	}

	const resp = await fetch(path, {
		headers: {
			Accept: 'text/html',
			'Accept-Encoding': 'gzip',
			'Accept-Language': lang,
			'User-Agent': firefoxAndroid,
			Cookie: `awx_user=tp:${unit}|lang:${lang};`,
		},
	})

	let text = await resp.text()

	text = text.slice(text.indexOf('</head>'))
	text = text.replaceAll('\n', '').replaceAll('\t', '')
	text = decode(text)

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
 * @prop {number} timestamp - Unix timestamp
 * @prop {number} temp - Classic temperature
 * @prop {string} rain - Percent chance of rain
 */

/**
 * @typedef {Object} Daily
 * @prop {number} timestamp - Unix timestamp
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
