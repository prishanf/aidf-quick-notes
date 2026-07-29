import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '../app/utils/markdown'

describe('renderMarkdown', () => {
  it('renders an empty body as an empty string', () => {
    expect(renderMarkdown('')).toBe('')
  })

  it('renders headings, emphasis, links, lists, code, and blockquotes', () => {
    const html = renderMarkdown(
      '# Heading\n\n**bold** and _italic_ and `code`\n\n'
      + '- one\n- two\n\n[link](https://example.com)\n\n> quoted',
    )
    expect(html).toContain('<h1>Heading</h1>')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<em>italic</em>')
    expect(html).toContain('<code>code</code>')
    expect(html).toContain('<ul>')
    expect(html).toContain('<li>one</li>')
    expect(html).toContain('<a href="https://example.com">link</a>')
    expect(html).toContain('<blockquote>')
  })

  it('renders a fenced code block without executing its contents', () => {
    const html = renderMarkdown('```\nnpm run build\n```')
    expect(html).toContain('<pre>')
    expect(html).toContain('npm run build')
  })

  it('escapes literal HTML and script tags instead of executing them', () => {
    const html = renderMarkdown("<script>alert('unsafe')</script>\n\n<b>not real bold</b>")
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<b>not real bold</b>')
    expect(html).toContain('&lt;b&gt;')
  })

  it('does not render a javascript: scheme link as a clickable anchor', () => {
    const html = renderMarkdown('[click me](javascript:alert(1))')
    expect(html).not.toContain('<a ')
    expect(html).not.toContain('href="javascript:')
  })

  it('renders plain text with no Markdown syntax as a single paragraph', () => {
    const html = renderMarkdown('Buy milk and eggs.')
    expect(html).toBe('<p>Buy milk and eggs.</p>\n')
  })
})
