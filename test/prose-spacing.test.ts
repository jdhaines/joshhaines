import { describe, expect, it } from "vitest"
import { normalizeProseSpacing } from "../scripts/lib/prose-spacing.mjs"

function fixed(source: string) {
  return normalizeProseSpacing(source).source
}

describe("prose spacing normalization", () => {
  it("collapses a double space after a period", () => {
    const input = "I liked this book.  Collins makes a good argument.\n"
    expect(fixed(input)).toBe("I liked this book. Collins makes a good argument.\n")
  })

  it("collapses a double space after a question mark", () => {
    const input = "Really?  That surprised me.\n"
    expect(fixed(input)).toBe("Really? That surprised me.\n")
  })

  it("collapses a double space after a closing quote", () => {
    const input = 'He calls it "productive paranoia."  I think that\'s useful.\n'
    expect(fixed(input)).toBe(
      'He calls it "productive paranoia." I think that\'s useful.\n'
    )
  })

  it("collapses a run of 3+ spaces between prose tokens", () => {
    const input = "One sentence.   Another sentence.\n"
    expect(fixed(input)).toBe("One sentence. Another sentence.\n")
  })

  it("does not require a capital letter after the collapsed spacing", () => {
    const input = "See the note below.  it still applies here.\n"
    expect(fixed(input)).toBe("See the note below. it still applies here.\n")
  })

  it("leaves normal single-spaced prose untouched", () => {
    const input = "This is normal prose.\n\nAnother paragraph here.\n"
    expect(fixed(input)).toBe(input)
  })

  it("does not touch double spaces inside inline code", () => {
    const input = 'This has `const value = "a  b"` inline code.\n'
    expect(fixed(input)).toBe(input)
  })

  it("does not touch double spaces inside a fenced code block", () => {
    const input = 'Some prose.\n\n```js\nconst value = "a  b"\n```\n\nMore prose.\n'
    expect(fixed(input)).toBe(input)
  })

  it("preserves a Markdown hard line break (two trailing spaces)", () => {
    const input = "A Markdown hard break follows here.  \nThis is the next line.\n"
    expect(fixed(input)).toBe(input)
  })

  it("does not touch YAML frontmatter", () => {
    const input =
      '---\ntitle: "Two  spaces  here  should  stay"\n---\n\nBody text is fine.\n'
    expect(fixed(input)).toBe(input)
  })

  it("does not touch double spaces inside a raw URL", () => {
    const input = "Visit [this link](https://example.com/a%20%20b) for more.\n"
    expect(fixed(input)).toBe(input)
  })

  it("does not collapse ordered-list continuation-line indentation", () => {
    const input =
      "1. Retrieve and unencrypt your master key files from the\n" +
      "   safe and encrypted location.\n" +
      "2. Copy the contents of the encrypted folder into a\n" +
      "   temporary folder locally. (e.g. /tmp/asdf)\n"
    expect(fixed(input)).toBe(input)
  })

  it("still collapses a genuine double space inside a list item", () => {
    const input =
      "- This is one sentence.  This is another sentence in the same item.\n"
    expect(fixed(input)).toBe(
      "- This is one sentence. This is another sentence in the same item.\n"
    )
  })

  it("does not damage inline HTML/JSX-like MDX constructs", () => {
    const input =
      '<div class="callout">\n  <p>Some  prose inside HTML.</p>\n</div>\n\n' +
      "Normal paragraph.  With a double space to fix.\n"
    const result = fixed(input)
    // The double space inside the raw HTML block is left alone...
    expect(result).toContain("<p>Some  prose inside HTML.</p>")
    // ...but the double space in ordinary prose outside the HTML is fixed.
    expect(result).toContain("Normal paragraph. With a double space to fix.\n")
  })

  it("does not touch double spaces inside inline HTML on its own line", () => {
    const input = '<img src="/foo.png" alt="a  b">\n'
    expect(fixed(input)).toBe(input)
  })
})
