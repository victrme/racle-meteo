import { Parser } from 'htmlparser2'

interface FlatNode {
	tag: string
	text: string
	class?: string
	src?: string
	href?: string
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
		let href: undefined | string
		let src: undefined | string
		let className: undefined | string
		let textContent = ''
		let tagName = ''

		const parser = new Parser({
			onopentag(name, attributes) {
				if (name === 'script' || name === 'style') {
					return
				}

				if (name === 'a') href = attributes.href
				if (name === 'img') src = attributes.src

				tagName = name
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

					if (className) node.class = className
					if (tagName === 'a' && href) node.href = href
					if (tagName === 'img' && src) node.src = src

					flatNodes.push(node)

					href = undefined
					src = undefined
					className = undefined
					tagName = ''
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
