export function isAccuweather(json: AccuWeather.Weather | Foreca.Weather): json is AccuWeather.Weather {
	return json?.meta?.provider === 'accuweather'
}

export function isForeca(json: AccuWeather.Weather | Foreca.Weather): json is Foreca.Weather {
	return json?.meta?.provider === 'foreca'
}

export function isAccuweatherLocation(json: unknown[]): json is AccuWeather.Location[] {
	return !!(json[0] as AccuWeather.Location)?.key
}

export function isForecaLocation(json: unknown[]): json is Foreca.Location[] {
	return !!(json[0] as Foreca.Location)?.id
}

export interface QueryParams {
	provider: 'accuweather' | 'foreca' | 'weathercom' | 'auto' | ''
	debug: 'nodes' | 'content' | 'geo' | ''
	data: 'all' | 'simple'
	unit: 'C' | 'F'
	query: string
	lang: string
	lat?: string
	lon?: string
	geo?: unknown
}

export declare namespace Simple {
	interface Weather {
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

	type Locations = {
		name: string
		detail: string
	}[]
}

export declare namespace AccuWeather {
	interface Weather {
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

	interface Content {
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
			temp: string
			rain: string
		}[]
		daily: {
			high: string
			low: string
			day: string
			night: string
			rain: string
		}[]
	}

	interface Location {
		'key': string
		'name': string
		'longName': string
		// Unused, mostly null
		'englishName': string | null
		'gmtOffset': number
		'hasAlerts': boolean
		'hasForecastConfidence': boolean
		'hasPollen': boolean
		'hasMinuteCast': boolean
		'hasFutureRadar': boolean
		'lat': number
		'lon': number
		'mediaRegion': string | null
		'region': string | null
		'timeZone': string | null
		'timeZoneCode': string | null
		'zoom': string | null
		'administrativeArea': string | null
		'country': string | null
		'localizedName': string | null
		'primaryPostalCode': string | null
	}
}

export declare namespace Foreca {
	interface Weather {
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

	interface Content {
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
	interface Location {
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
	interface NetAPI {
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
}
