'use strict'

/************
	JSDoc
*************/

/**
 * @typedef {Object} QueryParams
 * @prop {"accuweather" | "foreca"} provider
 * @prop {"all" | "simple"} data
 * @prop {"C" | "F"} unit
 * @prop {string} lang
 * @prop {string} lat
 * @prop {string} lon
 */

/**
 * @typedef {Object} SimpleWeather
 * @prop {Object} now - Current weather information, with felt temperature
 * @prop {number} now.icon - Icon ID
 * @prop {number} now.temp - Classic temperature
 * @prop {number} now.feels - Felt temperature, using RealFeel® tech
 * @prop {string} now.description - Short weather description
 * @prop {Object} sun - Current day sun time information
 * @prop {[number, number]} sun.rise - Localized hour and minute sunrise
 * @prop {[number, number]} sun.set - Localized hour and minute sunset
 * @prop {{time: string, high: number, low: number}[]} daily - 5 days of daily forecast
 */

/**
 * @typedef {Object} AccuWeather
 * @prop {Object} now - Current weather information
 * @prop {number} now.icon - Icon ID, more here: https://developer.accuweather.com/weather-icons
 * @prop {number} now.temp - Classic temperature
 * @prop {number} now.feels - Felt temperature, using RealFeel® tech
 * @prop {string} now.description - Short weather description
 * @prop {Object} sun - Sun rise and set today
 * @prop {[number, number]} sun.rise - Localized hour and minute sunrise
 * @prop {[number, number]} sun.set - Localized hour and minute sunset
 * @prop {{time: string, high: number, low: number}[]} hourly - 12 hours of hourly forecasted temperature and rain
 * @prop {{time: string, high: number, low: number, day: string, night: string, rain: string}[]} daily - 10 days of daily forecast
 */

/**
 * @typedef {Object} Foreca
 * @prop {string} city - Found city using coordinates
 * @prop {Object} now - Current weather information
 * @prop {string} now.icon - Icon ID, more here: https://developer.foreca.com/resources
 * @prop {string} now.humid - Humidity in pourcentage
 * @prop {string} now.description - Short weather description
 * @prop {{c: number, f: number}} now.low - Lowest temperature today
 * @prop {{c: number, f: number}} now.high - Highest temperature today
 * @prop {{c: number, f: number}} now.temp - Current temperature
 * @prop {{c: number, f: number}} now.feels - Felt temperature
 * @prop {{kmh: number, mph: number}} now.wind - Current average wind speeds
 * @prop {{rise: [number, number], set: [number, number]}} sun - Sun rise and set today
 * @prop {{time: string, high: {c: number, f: number}, low: {c: number, f: number}, wind: {kmh: number, mph: number} rain: {mm: number, in: number}}[]} daily - 5 days of daily forecast
 */

/**
 * Ids found for a specific location by foreca to display correct weather
 *
 * @typedef {Object} ForecaGeo
 * @prop {string} id
 * @prop {string} numeric_id
 * @prop {number} lon
 * @prop {number} lat
 * @prop {number} elevation
 * @prop {number} population
 * @prop {string} continentId
 * @prop {string} countryId
 * @prop {string} timezone
 * @prop {string} name
 * @prop {string} countryName
 * @prop {string} defaultName
 * @prop {string} defaultCountryName
 */

/**
 * Unprotected API available for all, thanks Foreca devs
 *
 * @typedef {Object} ForecaNetApi
 * @prop {string} date
 * @prop {string} symb
 * @prop {number} tmin
 * @prop {number} tmax
 * @prop {number} rain
 * @prop {number} rainp
 * @prop {number} snowp
 * @prop {number} snowff
 * @prop {number} rhum
 * @prop {number} windd
 * @prop {number} winds
 * @prop {string} sunrise
 * @prop {string} sunset
 * @prop {string} daylen
 * @prop {number} uvi
 * @prop {string} updated
 */

/******************
	JSON Typedef
*******************/

const SIMPLE_WEATHER = {
	now: {
		icon: 'string',
		temp: 'number',
		feels: 'number',
		description: 'string',
	},
	sun: {
		rise: ['number', 'number'],
		set: ['number', 'number'],
	},
	daily: [
		{
			time: 'Date',
			high: 'number',
			low: 'number',
		},
	],
}

export {}
