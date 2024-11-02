import { Parser } from 'htmlparser2'

interface FlatNode {
	tag: string
	text: string
	class: string
	src?: string
	href?: string
}

export default async function flatNodes(html: string): Promise<FlatNode[]> {
	return await new Promise((r) => {
		const result: FlatNode[] = []
		let href: undefined | string
		let src: undefined | string
		let textContent = ''
		let className = ''
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
				if (className && textContent) {
					const node: FlatNode = {
						tag: tagName,
						class: className,
						text: textContent,
					}

					if (tagName === 'a' && href) node.href = href
					if (tagName === 'img' && src) node.src = src

					result.push(node)

					href = undefined
					src = undefined
					tagName = ''
					className = ''
					textContent = ''
				}
			},
			onend() {
				r(result)
			},
		})

		parser.write(html)
		parser.end()
	})
}
