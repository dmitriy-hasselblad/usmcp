"use client"

import { Bold, Heading2, Heading3, List, ListOrdered } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"

type JobDescriptionEditorProps = {
  name: string
  maxLength?: number
}

export function JobDescriptionEditor({
  name,
  maxLength = 10000,
}: JobDescriptionEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState("")

  const syncValue = () => {
    const editor = editorRef.current
    if (!editor) return
    setValue(serializeEditor(editor).slice(0, maxLength))
  }

  const applyCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    syncValue()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== " ") return

    const selection = window.getSelection()
    const node = selection?.anchorNode
    if (!selection || !node) return

    const textNode = node.nodeType === Node.TEXT_NODE ? node : node.firstChild
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return

    const beforeCaret = textNode.textContent?.slice(0, selection.anchorOffset) ?? ""
    const command = /^[-*+]$/.test(beforeCaret)
      ? "insertUnorderedList"
      : /^\d+[.)]$/.test(beforeCaret)
        ? "insertOrderedList"
        : null

    if (!command) return

    event.preventDefault()
    const range = document.createRange()
    range.setStart(textNode, 0)
    range.setEnd(textNode, selection.anchorOffset)
    range.deleteContents()
    selection.removeAllRanges()
    selection.addRange(range)
    document.execCommand(command, false)
    syncValue()
  }

  return (
    <div className="overflow-hidden rounded-xl border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
      <input name={name} type="hidden" value={value} />
      <div className="flex flex-wrap gap-1 border-b border-border bg-muted/35 p-2">
        <ToolbarButton label="Bold" onClick={() => applyCommand("bold")}>
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Heading" onClick={() => applyCommand("formatBlock", "h2")}>
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Subheading" onClick={() => applyCommand("formatBlock", "h3")}>
          <Heading3 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Bulleted list" onClick={() => applyCommand("insertUnorderedList")}>
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" onClick={() => applyCommand("insertOrderedList")}>
          <ListOrdered className="size-4" />
        </ToolbarButton>
      </div>
      <div
        aria-describedby={`${name}-help`}
        aria-label="Job description editor"
        className="min-h-64 px-4 py-3 text-sm leading-6 outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] [&_h2]:my-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:my-3 [&_h3]:text-base [&_h3]:font-semibold [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5"
        contentEditable
        data-placeholder="Describe the role, responsibilities, qualifications, schedule, and benefits."
        onInput={syncValue}
        onKeyDown={handleKeyDown}
        ref={editorRef}
        role="textbox"
        suppressContentEditableWarning
      />
      <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground" id={`${name}-help`}>
        Use headings and lists from the toolbar. Typing <strong>*</strong>, <strong>-</strong>, <strong>1.</strong>, or <strong>1)</strong> followed by a space starts a list automatically.
      </p>
    </div>
  )
}

function ToolbarButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Button aria-label={label} onClick={onClick} size="icon-sm" type="button" variant="ghost">
      {children}
    </Button>
  )
}

function serializeEditor(element: HTMLElement) {
  return Array.from(element.childNodes)
    .map((node) => serializeNode(node))
    .filter(Boolean)
    .join("\n\n")
    .trim()
}

function serializeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ""
  if (!(node instanceof HTMLElement)) return ""

  const text = () => serializeInline(node).trim()

  if (node.tagName === "H2") return text() ? `## ${text()}` : ""
  if (node.tagName === "H3") return text() ? `### ${text()}` : ""
  if (node.tagName === "UL") {
    return Array.from(node.children)
      .filter((child) => child.tagName === "LI")
      .map((child) => `* ${serializeInline(child).trim()}`)
      .join("\n")
  }
  if (node.tagName === "OL") {
    return Array.from(node.children)
      .filter((child) => child.tagName === "LI")
      .map((child, index) => `${index + 1}. ${serializeInline(child).trim()}`)
      .join("\n")
  }
  return text()
}

function serializeInline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ""
  if (!(node instanceof HTMLElement)) return ""
  if (node.tagName === "BR") return "\n"

  const content = Array.from(node.childNodes).map(serializeInline).join("")
  return node.tagName === "STRONG" || node.tagName === "B" ? `**${content}**` : content
}
