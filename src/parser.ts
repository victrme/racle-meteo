import { Parser } from 'htmlparser2'

export interface FlatNode {
	tag: string
	text: string
	id?: string
	class?: string
	attr?: Record<string, string>
}

const flatNodes: FlatNode[] = []
const flatNodesSet: Set<FlatNode> = new Set()

export function findAll(className: string): FlatNode[] {
	return flatNodes.filter((node) => node.class?.includes(className))
}

export function find(className: string): FlatNode {
	return findAll(className)[0]
}

// export function next(className: string): FlatNode {
// 	return
// }

export default async function parseToFlatNodes(html: string): Promise<FlatNode[]> {
	await new Promise((r) => {
		let textContent = ''
		let className = ''
		let tagName = ''
		let id = ''
		let attr: Record<string, string> = {}

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
					flatNodesSet.add(node)

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

		parser.write(html)
		parser.end()
	})

	return flatNodes
}
