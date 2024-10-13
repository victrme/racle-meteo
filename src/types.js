'use strict'

/*************
	Simple
**************/

/**
 * @typedef {Object} SimpleWeather
 * @prop {Object} meta - Information about the request itself
 * @prop {string} meta.url - The URL from which the data comes from
 * @prop {string} meta.lang - Returns the lang used for this request
 * @prop {"accuweather" | "foreca"} meta.provider - Weather provider used to resolve this request
 * @prop {Object} geo - Geolocation information
 * @prop {number} geo.lat - Requested latitude
 * @prop {number} geo.lon - Requested longitude
 * @prop {string} geo.city - Found city based on GPS coordinates
 * @prop {string} geo.country - Found country based on GPS coordinates
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

/*****************
	Accuweather
******************/

/**
 * @typedef {Object} AccuWeather
 * @prop {Object} meta - Information about the request itself
 * @prop {string} meta.url - The URL from which the data comes from
 * @prop {string} meta.lang - Returns the lang used for this request
 * @prop {"accuweather" | "foreca"} meta.provider - Weather provider used to resolve this request
 * @prop {Object} geo - Geolocation information
 * @prop {number} geo.lat - Requested latitude
 * @prop {number} geo.lon - Requested longitude
 * @prop {string} geo.city - Found city based on GPS coordinates
 * @prop {string} geo.country - Found country based on GPS coordinates
 * @prop {Object} now - Current weather information
 * @prop {string} now.icon - Icon ID, more here: https://developer.accuweather.com/weather-icons
 * @prop {number} now.temp - Classic temperature
 * @prop {number} now.feels - Felt temperature, using RealFeel® tech
 * @prop {string} now.description - Short weather description
 * @prop {Object} sun - Sun rise and set today
 * @prop {[number, number]} sun.rise - Localized hour and minute sunrise
 * @prop {[number, number]} sun.set - Localized hour and minute sunset
 * @prop {{time: string, high: number, low: number}[]} hourly - 12 hours of hourly forecasted temperature and rain
 * @prop {{time: string, high: number, low: number, day: string, night: string, rain: string}[]} daily - 10 days of daily forecast
 */

/*************
	Foreca
**************/

/**
 * @typedef {Object} Foreca
 * @prop {Object} meta - Information about the request itself
 * @prop {string} meta.url - The URL from which the data comes from
 * @prop {string} meta.lang - Returns the lang used for this request
 * @prop {"accuweather" | "foreca"} meta.provider - Weather provider used to resolve this request
 * @prop {Object} geo - Geolocation information
 * @prop {number} geo.lat - Requested latitude
 * @prop {number} geo.lon - Requested longitude
 * @prop {string} geo.city - Found city based on GPS coordinates
 * @prop {string} geo.country - Found country based on GPS coordinates
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

export {}
