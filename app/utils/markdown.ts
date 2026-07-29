import MarkdownIt from 'markdown-it'

// Safe CommonMark subset: html:false escapes any literal HTML/script in the
// source to visible text instead of executing it. This is what keeps
// Feature 4 off Track C — see docs/specs/004-markdown-note-body.md.
const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
})

export function renderMarkdown(body: string): string {
  return body ? md.render(body) : ''
}
