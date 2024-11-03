import { Parser } from 'htmlparser2'

export interface FlatNode {
	tag: string
	text: string
	id?: string
	class?: string
	attr?: Record<string, string>
}

const flatNodes: FlatNode[] = []

export function findAll(className: string): FlatNode[] {
	return flatNodes.filter((node) => node.class?.includes(className))
}

export function find(className: string): FlatNode {
	return findAll(className)[0]
}

export default async function parseToFlatNodes(html: string): Promise<FlatNode[]> {
	await new Promise((r) => {
		let textContent = ''
		let className = ''
		let tagName = ''
		let id = ''
		let attr: Record<string, string> = {}

		const parser = new Parser({
			onopentag(name, attributes) {
				if (name === 'script' || name === 'style') {
					return
				}

				if (attributes['data-src']) attr['data-src'] = attributes['data-src']
				if (name === 'a') attr.href = attributes.href
				if (name === 'img') attr.src = attributes.src

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
				if (tagName && textContent) {
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

		parser.write(html)
		parser.end()
	})

	return flatNodes
}
