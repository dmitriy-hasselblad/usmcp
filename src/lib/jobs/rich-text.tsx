import { Fragment } from "react"

type Block =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered"; items: string[] }
  | { type: "ordered"; items: string[] }

const headingPattern = /^(#{2,3})\s+(.+)$/
const unorderedPattern = /^[-*+]\s+(.+)$/
const orderedPattern = /^\d+[.)]\s+(.+)$/

export function plainTextFromJobDescription(value: string) {
  return value
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+[.)]\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\n{2,}/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function parseBlocks(value: string): Block[] {
  const lines = value.replace(/\r\n?/g, "\n").split("\n")
  const blocks: Block[] = []
  let paragraph: string[] = []
  let list: { type: "unordered" | "ordered"; items: string[] } | null = null

  const flushParagraph = () => {
    const text = paragraph.join("\n").trim()
    if (text) blocks.push({ type: "paragraph", text })
    paragraph = []
  }
  const flushList = () => {
    if (list?.items.length) blocks.push(list)
    list = null
  }

  for (const line of lines) {
    const heading = line.match(headingPattern)
    const unordered = line.match(unorderedPattern)
    const ordered = line.match(orderedPattern)

    if (heading) {
      flushParagraph()
      flushList()
      blocks.push({
        type: "heading",
        level: heading[1].length === 3 ? 3 : 2,
        text: heading[2],
      })
      continue
    }

    if (unordered || ordered) {
      flushParagraph()
      const type = unordered ? "unordered" : "ordered"
      const item = (unordered ?? ordered)![1]
      if (!list || list.type !== type) {
        flushList()
        list = { type, items: [] }
      }
      list.items.push(item)
      continue
    }

    if (!line.trim()) {
      flushParagraph()
      flushList()
      continue
    }

    flushList()
    paragraph.push(line)
  }

  flushParagraph()
  flushList()
  return blocks
}

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.+?\*\*)/g)

  return parts.map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  )
}

export function JobDescriptionContent({ value }: { value: string }) {
  const blocks = parseBlocks(value)

  if (!blocks.length) return null

  return (
    <div className="space-y-5 text-[0.975rem] leading-7 text-muted-foreground">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Tag = block.level === 2 ? "h2" : "h3"
          return (
            <Tag
              className={
                block.level === 2
                  ? "pt-1 text-xl font-semibold tracking-[-0.025em] text-foreground"
                  : "pt-1 text-base font-semibold text-foreground"
              }
              key={index}
            >
              <InlineText text={block.text} />
            </Tag>
          )
        }

        if (block.type === "unordered") {
          return (
            <ul className="list-disc space-y-1.5 pl-5 marker:text-foreground" key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}><InlineText text={item} /></li>
              ))}
            </ul>
          )
        }

        if (block.type === "ordered") {
          return (
            <ol className="list-decimal space-y-1.5 pl-5 marker:font-medium marker:text-foreground" key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}><InlineText text={item} /></li>
              ))}
            </ol>
          )
        }

        return (
          <p className="whitespace-pre-line" key={index}>
            <InlineText text={block.text} />
          </p>
        )
      })}
    </div>
  )
}
