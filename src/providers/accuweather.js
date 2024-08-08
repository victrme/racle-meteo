import { htmlContentToStringArray } from './shared'
import { decode } from 'html-entities'

export function parseContentWithList(html) {
	let list = (html = htmlContentToStringArray(
		html,
		html.indexOf('<body'),
		html.lastIndexOf('</body')
	))

	const isEnglishLayout = list.includes("Tonight's Weather")

	if (isEnglishLayout) {
		list = [...list.slice(0, 39), ...list.slice(45)]
	}

	let date = new Date()
	let hourly = []
	let daily = []

	for (let i = 62; i <= 97; i += 3) {
		hourly.push({
			timestamp: date.getTime(),
			temp: parseInt(list[i + 1]),
			rain: list[i + 2].replace(' ', ''),
		})
	}

	for (let i = 101; i <= 170; i += 7) {
		daily.push({
			timestamp: date.getTime(),
			low: parseInt(list[i + 0]),
			high: parseInt(list[i + 1]),
			day: list[i + 2],
			night: list[i + 3],
			rain: list[i + 4],
		})
	}

	return {
		city: list[1],
		region: list[1],
		now: {
			temp: list[41],
			feels: list[46],
			description: list[43],
			icon: undefined,
		},
		hourly: hourly,
		daily: daily,
		sun: {
			duration: list[164],
			rise: list[166],
			set: list[168],
		},
	}
}

/**
 * @param {string} html
 * @returns {AccuWeather}
 */
export function parseContent(html) {
	let date = new Date()

	/** @type {AccuWeather} */
	let result = {}

	html = html.replaceAll('°', '')

	const location = htmlContentToStringArray(html, html.indexOf('<h1 '), html.indexOf('</h1>'))
	const [city, region] = location[0].split(', ')

	result.city = city
	result.region = region

	let link = html.slice(html.indexOf('header-city-link'), html.indexOf('<h1'))
	link = link.slice(link.indexOf('href="') + 6, link.indexOf('">'))

	result.link = 'https://www.accuweather.com' + link

	let icon = html.slice(html.indexOf('forecast-container'), html.indexOf('temp-container'))

	icon = icon.slice(icon.indexOf('data-src="'), icon.indexOf('.svg"') + 5)
	icon = icon.slice(icon.lastIndexOf('/') + 1, icon.indexOf('.'))

	result.now = {
		icon: parseInt(icon),
	}

	let current = htmlContentToStringArray(
		html,
		html.indexOf('cur-con-weather-card'),
		html.indexOf('local-forecast-summary')
	)

	result.now.temp = parseInt(current[3])
	result.now.feels = parseInt(current[6].replace('RealFeel®', ''))
	result.now.description = current[5]

	let sun = htmlContentToStringArray(
		html,
		html.indexOf('sunrise-sunset__body'),
		html.indexOf('air-quality-module__title')
	)

	let sunrisePM = sun[3].includes('PM')
	let sunsetPM = sun[5].includes('PM')
	let [rh, rm] = sun[3].replace('AM', '').replace('PM', '').split(':')
	let [sh, sm] = sun[5].replace('AM', '').replace('PM', '').split(':')

	rm = parseInt(rm) + (sunrisePM ? 12 : 0)
	sm = parseInt(sm) + (sunsetPM ? 12 : 0)

	date = new Date()
	const sunrise = new Date(date.getFullYear(), date.getMonth(), date.getDate(), rh, rm)
	const sunset = new Date(date.getFullYear(), date.getMonth(), date.getDate(), sh, sm)

	result.sun = {
		duration: sun[1],
		rise: sunrise.getTime(),
		set: sunset.getTime(),
	}

	if (html.indexOf('today-forecast-card') > 0) {
		let today = htmlContentToStringArray(
			html,
			html.indexOf('today-forecast-card'),
			html.indexOf('cur-con-weather-card')
		)

		result.today = {
			day: today[3].trimStart(),
			night: today[5].slice(today[5].indexOf(': ') + 2),
			high: parseInt(today[4].slice(4)),
			low: parseInt(today[6].slice(4)),
		}
	}

	let hourly = htmlContentToStringArray(
		html,
		html.indexOf('hourly-list__list-wrapper'),
		html.indexOf('daily-list')
	)

	hourly.shift()
	hourly.pop()
	result.hourly = []

	date = new Date()
	date.setMinutes(0)
	date.setSeconds(0)
	date.setMilliseconds(0)

	for (let i = 0; i < hourly.length; i += 3) {
		result.hourly.push({
			timestamp: date.getTime(),
			temp: parseInt(hourly[i + 1]),
			rain: hourly[i + 2].replace(' ', ''),
		})

		date.setHours(date.getHours() + 1)
	}

	let daily = htmlContentToStringArray(
		html,
		html.indexOf('daily-list-body'),
		html.indexOf('sunrise-sunset')
	)

	result.daily = []

	date = new Date()
	date.setMinutes(0)
	date.setSeconds(0)
	date.setMilliseconds(0)

	for (let i = 2; i < daily.length; i += 7) {
		result.daily.push({
			timestamp: date.getTime(),
			high: parseInt(daily[i + 1]),
			low: parseInt(daily[i + 2]),
			day: daily[i + 3],
			night: daily[i + 4],
			rain: daily[i + 5],
		})

		date.setDate(date.getDate() + 1)
	}

	return result
}

// Requests

/**
 * Return accuweather.com HTML page with all the necessery information
 *
 * @param {number} lat - Latitude coordinates
 * @param {number} lon - Longitude coordinates
 * @param {string} lang - Content language, "en" by default
 * @param {"C" | "F"} unit - Either celsius or football fields
 * @returns {Promise<string>}
 */
export async function getWeatherHTML(lat, lon, lang, unit) {
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

// Types

/**
 * @typedef {Object} AccuWeather
 * @prop {string} city - City location found by the provider
 * @prop {string} region - Region can be a district or a state
 * @prop {string} link - AccuWeather URL to access data
 * @prop {Now} now - Current weather information, with felt temperature
 * @prop {Sun} sun - Current day sun time information
 * @prop {Today} [today] - Today's information. Only available in english
 * @prop {Hourly[]} hourly - 12 hours of hourly forecasted temperature and rain
 * @prop {Daily[]} daily - 10 days of daily forecast, similar to "today"
 */

/**
 * @typedef {Object} Today
 * @prop {string} day - Description of today's weather
 * @prop {string} night - Description of tonight's weather
 * @prop {number} high - Expected temperature high for today
 * @prop {number} low - Expected temperature low for today
 */

/**
 * @typedef {Object} Now
 * @prop {number} icon - Icon ID, more here: https://developer.accuweather.com/weather-icons
 * @prop {number} temp - Classic temperature
 * @prop {number} feels - Felt temperature, using RealFeel® tech
 * @prop {string} description - Short weather description
 */

/**
 * @typedef {Object} Sun
 * @prop {string} duration - A string for the time between sunrise and sunset
 * @prop {number} rise - Sunrise timestamp today
 * @prop {number} set - Sunset timestamp today
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
