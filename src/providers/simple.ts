import type { AccuWeather, Foreca, QueryParams, Simple } from '../types.ts'
import { isAccuweather, isForeca } from '../types.ts'

export default function toSimpleWeather(json: AccuWeather.Weather | Foreca.Weather, params: QueryParams): Simple.Weather {
	const { provider, unit } = params

	const simple: Simple.Weather = {
		meta: { ...json.meta },
		geo: { ...json.geo },
		now: {
			icon: json.now.icon,
			description: json.now.description,
			temp: 0,
			feels: 0,
		},
		sun: {
			rise: json.sun.rise,
			set: json.sun.set,
		},
		daily: [] as Simple.Weather['daily'],
	}

	if ((provider === 'auto' || provider === 'foreca') && isForeca(json)) {
		const degrees = unit === 'F' ? 'f' : 'c'

		simple.now.icon = transformToSimpleIcon(simple.now.icon, 'foreca')
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

	if ((provider === 'auto' || provider === 'accuweather') && isAccuweather(json)) {
		simple.now.icon = transformToSimpleIcon(simple.now.icon, 'accuweather')
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

function transformToSimpleIcon(id: string, provider: 'accuweather' | 'foreca'): string {
	for (const [simpleId, providerIds] of Object.entries(SIMPLE_ICONS)) {
		const list = providerIds[provider]

		if (list.includes(id)) {
			return simpleId
		}
	}

	return id
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
		accuweather: '1, 2, 33, 34',
		foreca: 'd000, d100, n000, n100',
	},
	fewclouds: {
		accuweather: '3, 4, 5, 35, 36, 37',
		foreca: 'd200, d500, n200, n500',
	},
	brokenclouds: {
		accuweather: '6, 7, 38',
		foreca: 'd300, n300',
	},
	overcastclouds: {
		accuweather: '8',
		foreca: 'd400, n400',
	},
	sunnyrain: {
		accuweather: '14, 17',
		foreca: 'd210, n210',
	},
	lightrain: {
		accuweather: '12, 13, 39',
		foreca: 'd310, d410, d240, n310, n410, n240',
	},
	rain: {
		accuweather: '18, 19, 29, 40',
		foreca: 'd320, d420, d430, n320, n420, n430',
	},
	thunderstorm: {
		accuweather: '15, 16, 41, 42',
		foreca: 'd340, d440, n340, n440',
	},
	snow: {
		accuweather: '20, 21, 22, 23, 24, 25, 26, 43, 44',
		foreca:
			'd221, d311, d411, d221, d321, d431, d212, d312, d412, d222, d322, d422, d432, n221, n311, n411, n221, n321, n431, n212, n312, n412, n222, n322, n422, n432',
	},
	mist: {
		accuweather: '11',
		foreca: 'd600, n600',
	},
})
