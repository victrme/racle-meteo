const SIMPLE_STRUCT = {
	meta: {
		url: 'string',
		lang: 'string',
		provider: 'string',
	},
	geo: {
		lat: 'number',
		lon: 'number',
		city: 'string',
		country: 'string',
	},
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
			time: 'string',
			high: 'number',
			low: 'number',
		},
	],
}

const SIMPLE_GEO_STRUCT = [
	{
		name: 'string',
		details: 'string',
	},
]

const ACCUWEATHER_STRUCT = {
	meta: {
		url: 'string',
		lang: 'string',
		provider: 'string',
	},
	geo: {
		lat: 'number',
		lon: 'number',
		city: 'string',
		country: 'string',
	},
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
	hourly: [
		{
			time: 'string',
			temp: 'number',
			rain: 'string',
		},
	],
	daily: [
		{
			time: 'string',
			day: 'string',
			night: 'string',
			high: 'number',
			low: 'number',
		},
	],
}

const ACCUWEATHER_GEO_STRUCT = [
	{
		name: 'string',
		details: 'string',
	},
]

const FORECA_STRUCT = {
	meta: {
		url: 'string',
		lang: 'string',
		provider: 'string',
	},
	geo: {
		lat: 'number',
		lon: 'number',
		city: 'string',
		country: 'string',
	},
	now: {
		icon: 'string',
		humid: 'string',
		description: 'string',
		temp: { c: 'number', f: 'number' },
		feels: { c: 'number', f: 'number' },
		wind: { kmh: 'number', mph: 'number' },
	},
	sun: {
		rise: ['number', 'number'],
		set: ['number', 'number'],
	},
	daily: [
		{
			low: { c: 'number', f: 'number' },
			high: { c: 'number', f: 'number' },
			wind: { kmh: 'number', mph: 'number' },
			rain: { in: 'number', mm: 'number' },
		},
	],
}

const FORECA_GEO_STRUCT = [
	{
		name: 'string',
		details: 'string',
	},
]

export const STRUCTS = {
	ACCUWEATHER: {
		WEATHER: ACCUWEATHER_STRUCT,
		GEO: ACCUWEATHER_GEO_STRUCT,
	},
	FORECA: {
		WEATHER: FORECA_STRUCT,
		GEO: FORECA_GEO_STRUCT,
	},
	SIMPLE: {
		WEATHER: SIMPLE_STRUCT,
		GEO: SIMPLE_GEO_STRUCT,
	},
}
