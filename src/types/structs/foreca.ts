export const FORECA_STRUCT = {
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

export const FORECA_GEO_STRUCT = [
	{
		name: 'string',
		details: 'string',
	},
]

export const FORECA_CONTENT_STRUCT = {
	now: {
		icon: 'string',
		humid: 'string',
		description: 'string',
		temp: { c: 'string', f: 'string' },
		feels: { c: 'string', f: 'string' },
		wind: { kmh: 'string', mph: 'string' },
	},
	sun: { rise: 'string', set: 'string' },
}
