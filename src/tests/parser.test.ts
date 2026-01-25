import parseToFlatNodes, { find, findAll, getAll, next, prev } from '../parser.ts'
import { assert } from './utils.ts'

Deno.test('Parser - Basic parsing', async function () {
    const html = `
        <div class="container">
            <span class="title">Hello World</span>
            <p class="description" id="desc">This is a test</p>
            <a href="https://example.com" class="link">Link</a>
        </div>
    `
    await parseToFlatNodes(html)
    const nodes = getAll()
    assert(nodes.length === 4, `Expected 4 nodes, got ${nodes.length}`)
})

Deno.test('Parser - Find by class', async function () {
    const html = `<div class="target">Found me</div>`
    await parseToFlatNodes(html)
    const node = find('target')
    assert(node.text === 'Found me')
})

Deno.test('Parser - Find all by class', async function () {
    const html = `
        <div class="item">1</div>
        <div class="item">2</div>
    `
    await parseToFlatNodes(html)
    const nodes = findAll('item')
    assert(nodes.length === 2)
})

Deno.test('Parser - Next sibling', async function () {
    const html = `
        <div class="first">First</div>
        <div class="second">Second</div>
    `
    await parseToFlatNodes(html)
    const node = next('first')
    assert(node.class === 'second')
    assert(node.text === 'Second')
})

Deno.test('Parser - Prev sibling', async function () {
    const html = `
        <div class="first">First</div>
        <div class="second">Second</div>
    `
    await parseToFlatNodes(html)
    const node = prev('second')
    assert(node.class === 'first')
})

Deno.test('Parser - Attributes and ID', async function () {
    const html = `<a href="test" id="my-id" class="my-class">Link</a>`
    await parseToFlatNodes(html)
    const node = find('my-class')
    assert(node.id === 'my-id')
    assert(node.attr?.href === 'test')
})
