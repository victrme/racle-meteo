import * as cheerio from 'cheerio/slim'

/** @typedef {import('../types').ForecaNetApi} ForecaNetApi */
/** @typedef {import('../types').ForecaGeo} ForecaGeo */
/** @typedef {import('../types').Foreca} Foreca */

/**
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Foreca>}
 */
export default async function foreca(lat, lon, lang, unit) {
	const html = await fetchPageContent(lat, lon, lang, unit)
	const json = transformToJson(html)
	const api = validateJson(json)

	return api
}

/**
 * @param {Record<string, unknown>} json
 * @returns {Foreca}
 */
function validateJson(json) {
	const [riseHour, riseMinutes] = json.sun.rise?.split(':')
	const [setHour, setMinutes] = json.sun.set?.split(':')

	const result = {
		city: json.city,
		now: {
			icon: json.now.icon.replace('/public/images/symbols/', '').replace('.svg', ''),
			description: json.now.description,
			humid: json.now.humid + '%',
			temp: {
				c: parseInt(json.now.temp.c),
				f: parseInt(json.now.temp.f),
			},
			feels: {
				c: parseInt(json.now.feels.c),
				f: parseInt(json.now.feels.f),
			},
			wind: {
				mps: parseInt(json.now.wind.mps),
				mph: parseInt(json.now.wind.mph),
			},
		},
		sun: {
			rise: [parseInt(riseHour), parseInt(riseMinutes)],
			set: [parseInt(setHour), parseInt(setMinutes)],
		},
		daily: json.daily?.map((day) => ({
			low: {
				c: parseInt(day.low.c),
				f: parseInt(day.low.f),
			},
			high: {
				c: parseInt(day.high.c),
				f: parseInt(day.high.f),
			},
			wind: {
				mps: parseInt(day.wind.mps),
				mph: parseInt(day.wind.mph),
			},
			rain: {
				in: parseFloat(day.rain.in),
				mm: parseFloat(day.rain.mm),
			},
		})),
	}

	const date = new Date()
	date.setMinutes(0)
	date.setSeconds(0)
	date.setMilliseconds(0)

	result.daily = result.daily.map((day) => {
		const time = date.toISOString()

		date.setDate(date.getDate() + 1)

		return {
			time: time,
			...day,
		}
	})

	return result
}

/**
 * @param {string} html
 * @returns {Record<string, unknown>}
 */
export function transformToJson(html) {
	const $ = cheerio.load(html)

	return {
		city: $('h1').text(),
		now: {
			temp: {
				c: $('.nowcast .temp p:nth(0) .temp_c').text(),
				f: $('.nowcast .temp p:nth(0) .temp_f').text(),
			},
			feels: {
				c: $('.nowcast .temp p:nth(1) .temp_c').text(),
				f: $('.nowcast .temp p:nth(1) .temp_f').text(),
			},
			wind: {
				kmh: $('.nowcast .wind .wind_kmh').text(),
				mph: $('.nowcast .wind .wind_mph').text(),
			},
			icon: $('.nowcast .symb img').attr('src'),
			description: $('.nowcast .wx').text(),
			humid: $('.nowcast .rhum em').text(),
		},
		sun: {
			rise: $('.nowcast .sun .time_24h:nth(0)').text(),
			set: $('.nowcast .sun .time_24h:nth(1)').text(),
		},
		daily: new Array(5).fill('').map((_, i) => ({
			high: {
				c: $(`.daycontainer:nth(${i}) .tempmax .temp_c`).text(),
				f: $(`.daycontainer:nth(${i}) .tempmax .temp_f`).text(),
			},
			low: {
				c: $(`.daycontainer:nth(${i}) .tempmin .temp_c`).text(),
				f: $(`.daycontainer:nth(${i}) .tempmin .temp_f`).text(),
			},
			wind: {
				mph: $(`.daycontainer:nth(${i}) .wind_mph`).text(),
				kmh: $(`.daycontainer:nth(${i}) .wind_kmh`).text(),
			},
			rain: {
				in: $(`.daycontainer:nth(${i}) .rain_in`).text(),
				mm: $(`.daycontainer:nth(${i}) .rain_mm`).text(),
			},
		})),
	}
}

/**
 * @param {number} lat
 * @param {number} lon
 * @param {string} lang
 * @param {"C" | "F"} unit
 * @returns {Promise<string>}
 */
export async function fetchPageContent(lat, lon, lang, unit) {
	if (VALID_LANGUAGES.indexOf(lang) === -1) {
		throw new Error('Language is not valid')
	}

	const { id, defaultName } = await getForecaLocation(lat, lon)

	if (!id || !defaultName) {
		throw new Error('Cannot get foreca ID or name')
	}

	const userAgent =
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0'
	const cookies = `fcaId=${id}; fcai18n=${lang}; fcaSettings-v2={"units":{"temp":"${unit}","wind":"kmh","rain":"mm","pres":"hPa","vis":"km"},"time":"24h","theme":"dark","language":"${lang}"};`
	const path = `https://www.foreca.com/${lang}/${id}/${defaultName}`

	const resp = await fetch(path, {
		headers: {
			Accept: 'text/html',
			'Accept-Encoding': 'gzip',
			'Accept-Language': 'en',
			'User-Agent': userAgent,
			Cookie: cookies,
		},
	})

	let html = await resp.text()
	html = html.replaceAll('\n', '').replaceAll('\t', '')

	return html
}

const VALID_LANGUAGES =
	'en, bg, cs, da, de, et, el, es, fr, hr, it, lv, hu, nl, pl, pt, ro, ru, sk, sv, uk'

const FORECA_ICONS = [
	{
		name: 'd000',
		text: 'Clear',
	},
	{
		name: 'd100',
		text: 'Mostly clear',
	},
	{
		name: 'd200',
		text: '',
	},
	{
		name: 'd300',
		text: '',
	},
	{
		name: 'd400',
		text: '',
	},
	{
		name: 'd500',
		text: 'Thin upper cloud',
	},
	{
		name: 'd600',
		text: 'Fog',
	},
	{
		name: 'd210',
		text: 'Partly cloudy and light rain',
	},
	{
		name: 'd310',
		text: 'Cloudy and light rain',
	},
	{
		name: 'd410',
		text: 'Overcast and light rain',
	},
	{
		name: 'd220',
		text: 'Partly cloudy and showers',
	},
	{
		name: 'd320',
		text: '',
	},
	{
		name: 'd420',
		text: '',
	},
	{
		name: 'd430',
		text: '',
	},
	{
		name: 'd240',
		text: 'Partly cloudy, thunderstorms with rain',
	},
	{
		name: 'd340',
		text: 'Cloudy, thunderstorms with rain',
	},
	{
		name: 'd440',
		text: '',
	},
	{
		name: 'd211',
		text: 'Partly cloudy and light wet snow',
	},
	{
		name: 'd311',
		text: 'Cloudy and light wet snow',
	},
	{
		name: 'd411',
		text: '',
	},
	{
		name: 'd221',
		text: 'Partly cloudy and wet snow showers',
	},
	{
		name: 'd321',
		text: 'Cloudy and wet snow showers',
	},
	{
		name: 'd421',
		text: 'Overcast and wet snow showers',
	},
	{
		name: 'd431',
		text: 'Overcast and wet snow',
	},
	{
		name: 'd212',
		text: 'Partly cloudy and light snow',
	},
	{
		name: 'd312',
		text: 'Cloudy and light snow',
	},
	{
		name: 'd412',
		text: 'Overcast and light snow',
	},
	{
		name: 'd222',
		text: 'Partly cloudy and snow showers',
	},
	{
		name: 'd322',
		text: 'Cloudy and snow showers',
	},
	{
		name: 'd422',
		text: 'Overcast and snow showers',
	},
	{
		name: 'd432',
		text: 'Overcast and snow',
	},
]

/**
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<ForecaGeo>}
 */
export async function getForecaLocation(lat, lon) {
	const resp = await fetch(`https://api.foreca.net/locations/${lon},${lat}.json`)
	const json = await resp.json()
	return json
}

/**
 * @param {number} lon
 * @param {number} lat
 * @returns {Promise<Record<string, ForecaNetApi[]>}
 */
export async function getForecaData(lat, lon) {
	const { id } = await getForecaLocation(lat, lon)
	const resp = await fetch(`https://api.foreca.net/data/favorites/${id}.json`)
	return await resp.json()
}
