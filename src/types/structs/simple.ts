export const SIMPLE_STRUCT = {
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

export const SIMPLE_GEO_STRUCT = [
	{
		name: 'string',
		details: 'string',
	},
]
