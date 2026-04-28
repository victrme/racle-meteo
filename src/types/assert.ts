import type { Accuweather, Foreca } from './index.ts'

export function isAccuweather(json: Accuweather.Weather | Foreca.Weather): json is Accuweather.Weather {
	return json?.meta?.provider === 'accuweather'
}

export function isForeca(json: Accuweather.Weather | Foreca.Weather): json is Foreca.Weather {
	return json?.meta?.provider === 'foreca'
}

export function isAccuweatherLocation(json: unknown[]): json is Accuweather.Location[] {
	return !!(json[0] as Accuweather.Location)?.key
}

export function isForecaLocation(json: unknown[]): json is Foreca.Location[] {
	return !!(json[0] as Foreca.Location)?.id
}
