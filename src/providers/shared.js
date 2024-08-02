import striptags from 'striptags'

/**
 * Slice relevent content, strip html tags, split strings.
 * Returns all non-empty tags in an array
 * @param {string} html
 * @param {number} start
 * @param {number} end
 * @returns {string[]}
 */
export function htmlContentToStringArray(html, start, end) {
	html = html.slice(start, end)
	html = striptags(html, undefined, '\n')
	html = html.split('\n').filter((v) => v.trim())
	return html
}
