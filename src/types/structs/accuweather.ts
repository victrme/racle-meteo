export const ACCUWEATHER_STRUCT = {
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

export const ACCUWEATHER_GEO_STRUCT = [
	{
		name: 'string',
		details: 'string',
	},
]

export const ACCUWEATHER_CONTENT_STRUCT = {
	meta: { url: 'string' },
	now: { icon: 'string', temp: 'string', feels: 'string', description: 'string' },
	sun: { rise: 'string', set: 'string' },
}
