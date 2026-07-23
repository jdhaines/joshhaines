// Nuxt Content's markdown pipeline (@nuxtjs/mdc) parses `[text]` bracket
// syntax as an inline "span" component (mdast node `{ type: 'textComponent',
// name: 'span' }`) before any user-configured remark plugin runs. This means
// GitHub's `> [!NOTE]` alert marker arrives at `remark-github-blockquote-alert`
// already wrapped in a span node instead of the plain `[!NOTE]` text it
// expects, so it never matches and the blockquote renders unstyled.
//
// This wrapper normalizes that span-wrapped marker back into plain
// `[!TYPE]` text before delegating to the real `remarkAlert` plugin, so
// GitHub-style alerts keep working unmodified in .md source files.
//
// Also re-exported as this file's default export (instead of just
// re-exporting `remarkAlert`) because Nuxt's markdown plugin codegen does a
// default import from the configured key, and `remark-github-blockquote-alert`
// only has a named export — see nuxt.config.ts.
import type { Blockquote, Paragraph, Root, Text } from 'mdast'
import { remarkAlert } from 'remark-github-blockquote-alert'
import { visit } from 'unist-util-visit'

const ALERT_TYPES = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION']

interface TextComponentNode {
  type: 'textComponent'
  name?: string
  children?: Array<{ value?: string }>
}

function isAlertSpan(node: unknown): node is TextComponentNode {
  return (
    !!node
    && typeof node === 'object'
    && (node as TextComponentNode).type === 'textComponent'
    && (node as TextComponentNode).name === 'span'
  )
}

function normalizeMdcAlertMarkers(tree: Root) {
  visit(tree, 'blockquote', (node: Blockquote) => {
    const paragraph = node.children[0] as Paragraph | undefined
    if (!paragraph || paragraph.type !== 'paragraph')
      return

    const first = paragraph.children[0]
    if (!isAlertSpan(first))
      return

    const value = first.children?.[0]?.value?.trim()
    const match = value ? /^!(\w+)$/.exec(value) : null
    const alertType = match?.[1]?.toUpperCase()
    if (!alertType || !ALERT_TYPES.includes(alertType))
      return

    const marker: Text = { type: 'text', value: `[!${alertType}]` }
    paragraph.children.splice(0, 1, marker)
  })
}

export default function remarkGithubAlertForMdc() {
  const alertTransformer = remarkAlert()

  return (tree: Root, file: unknown) => {
    normalizeMdcAlertMarkers(tree)
    return alertTransformer(tree, file)
  }
}
