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

export interface Content {
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

export interface Location {
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
