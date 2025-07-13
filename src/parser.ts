import { Parser } from '../htmlparser2/Parser.ts'

export interface FlatNode {
	tag: string
	text: string
	id?: string
	class?: string
	attr?: Record<string, string>
}

type FlatNodes = Map<number, FlatNode>

const flatNodes: FlatNodes = new Map()

export function getAll(): FlatNode[] {
	return Array.from(flatNodes.values())
}

export function findAll(className: string): FlatNode[] {
	const result: FlatNode[] = []

	for (const node of flatNodes.values()) {
		if (node.class?.includes(className)) {
			result.push(node)
		}
	}

	return result
}

export function find(className: string): FlatNode {
	for (const node of flatNodes.values()) {
		if (node.class?.includes(className)) {
			return node
		}
	}

	throw new Error(`${flatNodes.size} nodes. No node found with class="${className}"`)
}

export function next(className: string, step = 1): FlatNode {
	const node = sibling('next', className, step)

	if (!node) {
		throw new Error(`Element does not exist. Found ${flatNodes.size} nodes.`)
	}

	return node
}

export function nextAll(className: string, step = 1): FlatNode[] {
	const result: FlatNode[] = []

	for (const [i, node] of flatNodes.entries()) {
		if (node.class?.includes(className)) {
			result.push(sibling('next', i, step))
		}
	}

	return result
}

export function prev(className: string, step = 1): FlatNode {
	const node = sibling('prev', className, step)

	if (!node) {
		throw new Error(`Element does not exist. Negative index`)
	}

	return node
}

export function prevAll(className: string, step = 1): FlatNode[] {
	const result: FlatNode[] = []

	for (const [i, node] of flatNodes.entries()) {
		if (node.class?.includes(className)) {
			result.push(sibling('prev', i, step))
		}
	}

	return result
}

function sibling(is: 'prev' | 'next', selector: string | number, step = 1): FlatNode {
	const dir = is === 'prev' ? -1 : 1
	let nodeFound: FlatNode | undefined = undefined

	if (typeof selector === 'string') {
		for (const [pos, node] of flatNodes.entries()) {
			if (node.class?.includes(selector)) {
				nodeFound = flatNodes.get(pos + step * dir)
				break
			}
		}
	}

	if (typeof selector === 'number') {
		if (flatNodes.has(selector)) {
			nodeFound = flatNodes.get(selector + step * dir)
		}
	}

	if (!nodeFound) {
		throw new Error(`${flatNodes.size} nodes. No "${selector}" node found`)
	}

	return nodeFound
}

export default async function parseToFlatNodes(html: string): Promise<void> {
	await new Promise((r) => {
		let textContent = ''
		let className = ''
		let tagName = ''
		let id = ''
		let attr: Record<string, string> = {}

		let i = 0
		flatNodes.clear()

		const skippedtags = 'script, style, iframe, path, g, rect, circle, head, meta'

		const parser = new Parser({
			onopentag(name, attributes) {
				if (attributes['data-src']) attr['data-src'] = attributes['data-src']
				if (attributes['href']) attr.href = attributes.href
				if (attributes['src']) attr.src = attributes.src

				if (skippedtags.includes(name)) {
					return
				}

				tagName = name
				id = attributes.id
				className = attributes.class
			},
			ontext(text) {
				if (tagName) {
					textContent += text
				}
			},
			onclosetag(_) {
				if (tagName) {
					const node: FlatNode = {
						tag: tagName,
						text: textContent,
					}

					if (id) node.id = id
					if (className) node.class = className

					if (Object.keys(attr).length > 0) {
						node.attr = attr
					}

					flatNodes.set(i++, node)

					attr = {}
					tagName = ''
					className = ''
					textContent = ''
				}
			},
			onend() {
				r(true)
			},
		})

		parser.parseComplete(html)
	})
}
