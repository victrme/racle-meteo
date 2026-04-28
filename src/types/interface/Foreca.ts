export interface Weather {
	meta: {
		url: string
		lang: string
		provider: 'foreca'
	}
	geo: {
		lat?: number
		lon?: number
		city: string
		country: string
	}
	now: {
		icon: string
		humid: string
		description: string
		temp: { c: number; f: number }
		feels: { c: number; f: number }
		wind: { kmh: number; mph: number }
	}
	sun: {
		rise: [number, number]
		set: [number, number]
	}
	daily: {
		time: string
		high: { c: number; f: number }
		low: { c: number; f: number }
		wind: { kmh: number; mph: number }
		rain: { mm: number; in: number }
	}[]
}

export interface Content {
	now: {
		temp: { c: string; f: string }
		feels: { c: string; f: string }
		wind: { kmh: string; mph: string }
		icon: string
		humid: string
		description: string
	}
	sun: {
		rise: string
		set: string
	}
	daily: {
		high: { c: string; f: string }
		low: { c: string; f: string }
		wind: { kmh: string; mph: string }
		rain: { mm: string; in: string }
	}[]
}

/** Ids found for a specific location by foreca to display correct weather */
export interface Location {
	id: string
	numeric_id: string
	lon: number
	lat: number
	elevation: number
	population: number
	continentId: string
	countryId: string
	timezone: string
	name: string
	countryName: string
	defaultName: string
	defaultCountryName: string
}

/** Unprotected API available for all, thanks Foreca devs */
export interface NetAPI {
	date: string
	symb: string
	tmin: number
	tmax: number
	rain: number
	rainp: number
	snowp: number
	snowff: number
	rhum: number
	windd: number
	winds: number
	sunrise: string
	sunset: string
	daylen: string
	uvi: number
	updated: string
}
