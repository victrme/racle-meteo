import { Parser } from 'htmlparser2'

export interface FlatNode {
	tag: string
	text: string
	id?: string
	class?: string
	attr?: Record<string, string>
}

let flatNodes: FlatNode[] = []

export function findAll(className: string): FlatNode[] {
	const result: FlatNode[] = []

	for (let i = 0; i < flatNodes.length; i++) {
		if (flatNodes[i].class?.includes(className)) {
			result.push(flatNodes[i])
		}
	}

	return result
}

export function find(className: string): FlatNode {
	for (let i = 0; i < flatNodes.length; i++) {
		if (flatNodes[i].class?.includes(className)) {
			return flatNodes[i]
		}
	}

	throw new Error(`No node found with class="${className}"`)
}

export function next(className: string, step = 1): FlatNode {
	const i = sibling('next', className, step)
	const node = flatNodes[i]

	if (node) {
		return node
	} else {
		throw new Error(`Element does not exist. Found ${flatNodes.length} nodes, looking for number ${i + step + 1}.`)
	}
}

export function prev(className: string, step = 1): FlatNode {
	const i = sibling('prev', className, step)
	const node = flatNodes[i]

	if (node) {
		return node
	} else {
		throw new Error(`Element does not exist. Negative index ${(i + step) * -1}`)
	}
}

function sibling(is: 'prev' | 'next', className: string, step = 1): number {
	let i = 0

	for (; i < flatNodes.length; i++) {
		if (flatNodes[i].class?.includes(className)) {
			break
		}
	}

	const dir = is === 'prev' ? -1 : 1
	const siblingIndex = i + step * dir

	return siblingIndex
}

export default async function parseToFlatNodes(html: string): Promise<FlatNode[]> {
	await new Promise((r) => {
		let textContent = ''
		let className = ''
		let tagName = ''
		let id = ''
		let attr: Record<string, string> = {}

		flatNodes = []

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

					flatNodes.push(node)

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

	return flatNodes
}
