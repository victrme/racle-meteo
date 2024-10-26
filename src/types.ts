export function isAccuweather(json: AccuWeather | Foreca): json is AccuWeather {
	return json?.meta?.provider === 'accuweather'
}

export function isForeca(json: AccuWeather | Foreca): json is Foreca {
	return json?.meta?.provider === 'foreca'
}

export interface QueryParams {
	provider: 'accuweather' | 'foreca' | 'weathercom' | 'auto' | ''
	data: 'all' | 'simple'
	unit: 'C' | 'F'
	query: string
	lang: string
	lat: string
	lon: string
}

/*************
	Simple
**************/

export interface SimpleWeather {
	meta: {
		url: string
		lang: string
		provider: 'accuweather' | 'foreca'
	}
	geo: {
		lat: number
		lon: number
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

/*****************
	Accuweather
******************/

export interface AccuWeather {
	meta: {
		url: string
		lang: string
		provider: 'accuweather' | 'foreca'
	}
	geo: {
		lat: number
		lon: number
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
	hourly: {
		time: string
		temp: number
		rain: string
	}[]
	daily: {
		time: string
		high: number
		low: number
		day: string
		night: string
		rain: string
	}[]
}

export interface AccuweatherContent {
	meta: {
		url: string
	}
	now: {
		icon: string
		temp: string
		feels: string
		description: string
	}
	sun: {
		rise: string
		set: string
	}
	hourly: {
		time: string
		temp: string
		rain: string
	}[]
	daily: {
		time: string
		high: string
		low: string
		day: string
		night: string
		rain: string
	}[]
}

/*************
	Foreca
**************/

export interface Foreca {
	meta: {
		url: string
		lang: string
		provider: 'foreca'
	}
	geo: {
		lat: number
		lon: number
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

export interface ForecaContent {
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
export interface ForecaGeo {
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
export interface ForecaNetApi {
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
