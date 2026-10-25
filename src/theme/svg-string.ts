// Turns a painted scene's elements into SVG text, for previews and tests outside a browser.
// The scenes only use plain SVG elements, so a tiny serializer is enough.
import type { VNode } from 'preact'

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

export function toSvg(node: unknown): string {
  if (node == null || node === false) return ''
  if (Array.isArray(node)) return node.map(toSvg).join('')
  if (typeof node !== 'object') return escape(String(node))
  const { type, props } = node as VNode<Record<string, unknown>>
  const attrs = Object.entries(props)
    .filter(([k, v]) => k !== 'children' && v != null)
    .map(([k, v]) => ` ${k}="${escape(String(v))}"`)
    .join('')
  return `<${type as string}${attrs}>${toSvg(props.children)}</${type as string}>`
}
