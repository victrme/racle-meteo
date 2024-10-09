import scraper from './index.js'

await test()

async function test() {
	const url = 'https://example.com?lang=fr&lat=48.8582&lon=2.2944'
	const resp = await scraper.fetch(new Request(url))
	const json = await resp.json()
	const types = scraperTypes()

	compareTypes(json, types)
	console.log('✅ Type test passed', '\n')
}

function compareTypes(obj, types) {
	for (const [key, type] of Object.entries(types)) {
		if (typeof type === 'object') {
			compareTypes(obj[key], type)
			continue
		}

		if (typeof obj[key] !== type) {
			throw `"${key}" should be of type "${type}", but got "${typeof obj[key]}"`
		}
	}
}

function scraperTypes() {
	return {
		now: {
			icon: 'number',
			temp: 'number',
			feels: 'number',
			description: 'string',
		},
		hourly: [
			{
				timestamp: 'number',
				temp: 'number',
				rain: 'string',
			},
		],
		daily: [
			{
				timestamp: 'number',
				high: 'number',
				low: 'number',
				day: 'string',
				night: 'string',
				rain: 'string',
			},
		],
		sun: {
			rise: 'number',
			set: 'number',
		},
	}
}
