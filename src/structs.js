export const SIMPLE_STRUCT = {
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

export const ACCUWEATHER_STRUCT = {
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

export const FORECA_STRUCT = {
	city: 'string',
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
