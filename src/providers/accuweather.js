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
			timestamp: date.toLocaleTimeString(),
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
			timestamp: date.toLocaleDateString(),
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

	if (json.sun.rise.includes('PM')) {
		riseHour = (parseInt(riseHour) + 12).toString()
	}
	if (json.sun.set.includes('PM')) {
		setHour = (parseInt(setHour) + 12).toString()
	}

	date.setHours(parseInt(riseHour))
	date.setMinutes(parseInt(riseMinute))
	const rise = date.toLocaleTimeString()

	date.setHours(parseInt(setHour))
	date.setMinutes(parseInt(setMinute))
	const set = date.toLocaleTimeString()

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
	const list_start = html.indexOf('<a class="cur-con-weather-card')
	const list_end = html.lastIndexOf('</body')
	const list = removeEnglishOnlyContent(htmlContentToStringArray(html, list_start, list_end))

	const icon_match = '/images/weathericons/'
	const icon_start = html.indexOf(icon_match) + icon_match.length
	const icon_end = html.indexOf('.svg', icon_start)
	const icon = html.slice(icon_start, icon_end)[0]

	// <!> Do not remove these, very useful
	// console.log(list)
	// console.log(locateNumbers(list))

	const hourly = []
	const daily = []

	for (const [hour, temp, rain] of hourlyIndexes) {
		hourly.push({
			timestamp: list[hour],
			temp: list[temp],
			rain: list[rain],
		})
	}

	for (const [date, high, low, rain] of dailyIndexes) {
		daily.push({
			timestamp: list[date],
			high: list[high],
			low: list[low],
			day: list[low + 1],
			night: list[low + 2],
			rain: list[rain],
		})
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
			rise: list[125],
			set: list[127],
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

const hourlyIndexes = [
	[14, 15, 16],
	[17, 18, 19],
	[20, 21, 22],
	[23, 24, 25],
	[26, 27, 28],
	[29, 30, 31],
	[32, 33, 34],
	[35, 36, 37],
	[38, 39, 40],
	[41, 42, 43],
	[44, 45, 46],
	[47, 48, 49],
]

const dailyIndexes = [
	[53, 54, 55, 58],
	[60, 61, 62, 65],
	[67, 68, 69, 72],
	[74, 75, 76, 79],
	[81, 82, 83, 86],
	[88, 89, 90, 93],
	[95, 96, 97, 100],
	[102, 103, 104, 107],
]

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
