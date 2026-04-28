export interface Weather {
	meta: {
		url: string
		lang: string
		provider: 'accuweather' | 'foreca'
	}
	geo: {
		lat?: number
		lon?: number
		city: string
		country: string
	}
	now: {
		icon: string
		temp: number
		feels: number
		description: string
	}
	sun: {
		rise: [number, number]
		set: [number, number]
	}
	daily: {
		time: string
		high: number
		low: number
	}[]
}

export type Locations = {
	name: string
	detail: string
}[]
