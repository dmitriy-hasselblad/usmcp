"use client"

import { Bold, Heading2, Heading3, List, ListOrdered } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"

type JobDescriptionEditorProps = {
  name: string
  maxLength?: number
  initialValue?: string | null
}

export function JobDescriptionEditor({
  name,
  maxLength = 10000,
  initialValue = "",
}: JobDescriptionEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const selectionRef = useRef<Range | null>(null)
  const [value, setValue] = useState(initialValue ?? "")

  useEffect(() => {
    const editor = editorRef.current
    if (!editor || editor.innerHTML) return
    editor.innerHTML = markdownToEditorHtml(initialValue ?? "")
  }, [initialValue])

  const syncValue = () => {
    const editor = editorRef.current
    if (!editor) return
    setValue(serializeEditor(editor).slice(0, maxLength))
  }

  const rememberSelection = () => {
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!editor || !selection?.rangeCount) return
    const range = selection.getRangeAt(0)
    if (editor.contains(range.commonAncestorContainer)) {
      selectionRef.current = range.cloneRange()
    }
  }

  const applyCommand = (command: string, commandValue?: string) => {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()
    const selection = window.getSelection()
    if (selectionRef.current) {
      selection?.removeAllRanges()
      selection?.addRange(selectionRef.current)
    }
    document.execCommand(command, false, commandValue)
    rememberSelection()
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
        <ToolbarButton label="Bold" onMouseDown={() => applyCommand("bold")}>
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Heading" onMouseDown={() => applyCommand("formatBlock", "h2")}>
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Subheading" onMouseDown={() => applyCommand("formatBlock", "h3")}>
          <Heading3 className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Bulleted list" onMouseDown={() => applyCommand("insertUnorderedList")}>
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" onMouseDown={() => applyCommand("insertOrderedList")}>
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
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
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

function ToolbarButton({ children, label, onMouseDown }: { children: React.ReactNode; label: string; onMouseDown: () => void }) {
  return (
    <Button
      aria-label={label}
      onMouseDown={(event) => {
        event.preventDefault()
        onMouseDown()
      }}
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      {children}
    </Button>
  )
}

function markdownToEditorHtml(value: string) {
  const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  const inline = (text: string) => escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  const lines = value.replace(/\r\n?/g, "\n").split("\n")
  const parts: string[] = []
  let list: { tag: "ol" | "ul"; items: string[] } | null = null
  const flushList = () => {
    if (!list) return
    parts.push(`<${list.tag}>${list.items.map((item) => `<li>${inline(item)}</li>`).join("")}</${list.tag}>`)
    list = null
  }
  for (const line of lines) {
    const heading = line.match(/^(#{2,3})\s+(.+)$/)
    const unordered = line.match(/^[-*+]\s+(.+)$/)
    const ordered = line.match(/^\d+[.)]\s+(.+)$/)
    if (heading) {
      flushList()
      const tag = heading[1].length === 2 ? "h2" : "h3"
      parts.push(`<${tag}>${inline(heading[2])}</${tag}>`)
    } else if (unordered || ordered) {
      const tag = unordered ? "ul" : "ol"
      if (!list || list.tag !== tag) {
        flushList()
        list = { tag, items: [] }
      }
      list.items.push((unordered ?? ordered)![1])
    } else {
      flushList()
      if (line.trim()) parts.push(`<div>${inline(line)}</div>`)
    }
  }
  flushList()
  return parts.join("")
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
