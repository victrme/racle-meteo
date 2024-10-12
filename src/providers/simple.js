/** @typedef {import('../index').QueryParams} QueryParams */
/** @typedef {import('../types').SimpleWeather} SimpleWeather */
/** @typedef {import('../types').AccuWeather} AccuWeather */
/** @typedef {import('../types').Foreca} Foreca */

/**
 * @param {AccuWeather | Foreca} json
 * @param {QueryParams} params
 * @returns {SimpleWeather}
 */
export function toSimpleWeather(json, params) {
	const { provider, unit } = params

	const simple = {
		now: {
			icon: json.now.icon,
			description: json.now.description,
		},
		sun: {
			rise: json.sun.rise,
			set: json.sun.set,
		},
		daily: [],
	}

	if (provider === 'foreca') {
		const degrees = unit === 'F' ? 'f' : 'c'

		simple.now.temp = json.now.temp[degrees]
		simple.now.feels = json.now.feels[degrees]

		for (let i = 0; i < 5; i++) {
			const day = json.daily[i]

			simple.daily.push({
				time: day.time,
				high: day.high[degrees],
				low: day.low[degrees],
			})
		}
	}

	if (provider === 'accuweather') {
		simple.now.icon = json.now.icon.toString()
		simple.now.temp = json.now.temp
		simple.now.feels = json.now.feels

		for (let i = 0; i < 5; i++) {
			const day = json.daily[i]

			simple.daily.push({
				time: day.time,
				high: day.high,
				low: day.low,
			})
		}
	}

	return simple
}

export const SIMPLE_ICON_NAMES = Object.freeze([
	'clearsky',
	'fewclouds',
	'brokenclouds',
	'overcastclouds',
	'sunnyrain',
	'lightrain',
	'rain',
	'thunderstorm',
	'snow',
	'mist',
])

export const SIMPLE_ICONS = Object.freeze({
	clearsky: {
		accu: '1, 2, 33, 34',
		foreca: 'd000, d100, n000, n100',
	},
	fewclouds: {
		accu: '3, 4, 5, 35, 36, 37',
		foreca: 'd200, d500, n200, n500',
	},
	brokenclouds: {
		accu: '6, 7, 38',
		foreca: 'd300, n300',
	},
	overcastclouds: {
		accu: '8',
		foreca: 'd400, n400',
	},
	sunnyrain: {
		accu: '14, 17',
		foreca: 'd210, n210',
	},
	lightrain: {
		accu: '12, 13, 39',
		foreca: 'd310, d410, d240, n310, n410, n240',
	},
	rain: {
		accu: '18, 19, 29, 40',
		foreca: 'd320, d420, d430, n320, n420, n430',
	},
	thunderstorm: {
		accu: '15, 16, 41, 42',
		foreca: 'd340, d440, n340, n440',
	},
	snow: {
		accu: '20, 21, 22, 23, 24, 25, 26, 43, 44',
		foreca: 'd221, d311, d411, d221, d321, d431, d212, d312, d412, d222, d322, d422, d432, n221, n311, n411, n221, n321, n431, n212, n312, n412, n222, n322, n422, n432',
	},
	mist: {
		accu: '11',
		foreca: 'd600, n600',
	},
})
