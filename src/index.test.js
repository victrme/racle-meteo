import { ACCUWEATHER_STRUCT, FORECA_STRUCT, SIMPLE_STRUCT } from './structs.js'
import main from './index.js'

await test()

async function test() {
	let result

	result = await getData('?lat=48.8582&lon=2.2944&provider=accuweather')
	compareTypes(result, ACCUWEATHER_STRUCT)('Basic Accuweather')

	result = await getData('?lat=48.8582&lon=2.2944&provider=foreca')
	compareTypes(result, FORECA_STRUCT)('Basic Foreca')

	result = await getData('?lat=48.8582&lon=2.2944&provider=accuweather&data=simple')
	compareTypes(result, SIMPLE_STRUCT)('Simple data with accuweather')

	result = await getData('?lat=48.8582&lon=2.2944&provider=foreca&data=simple')
	compareTypes(result, SIMPLE_STRUCT)('Simple data with foreca')
}

async function getData(query) {
	const resp = await main.fetch(new Request('https://example.com/' + query))
	const json = await resp.json()
	return json
}

function compareTypes(obj, struct) {
	for (const [key, type] of Object.entries(struct)) {
		if (typeof type === 'object') {
			compareTypes(obj[key], type)
			continue
		}

		if (typeof type !== 'string' && typeof obj[key] !== type) {
			throw `"${key}" should be of type "${type}", but got "${typeof obj[key]}"`
		}
	}

	return (log) => console.log('✅ ' + log, '\n')
}
