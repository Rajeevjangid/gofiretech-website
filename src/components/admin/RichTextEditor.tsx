'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Minus,
  Link as LinkIcon,
  Undo,
  Redo,
  Code2,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  error?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write something...',
  error,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        // StarterKit includes: Bold, Italic, Strike, Code, CodeBlock,
        // Blockquote, BulletList, OrderedList, HorizontalRule, History
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'rte-link' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'rte-content',
      },
    },
    onUpdate({ editor }) {
      // Return empty string when editor is blank so Zod min(10) fires correctly
      const html = editor.isEmpty ? '' : editor.getHTML()
      onChange(html)
    },
  })

  // Sync external value into editor (e.g. when initialData loads on edit page)
  useEffect(() => {
    if (!editor) return
    const currentHtml = editor.isEmpty ? '' : editor.getHTML()
    if (value !== currentHtml) {
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor])

  const setLink = () => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Enter URL', prev ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  if (!editor) return null

  // ── Toolbar button helper ──────────────────────────
  const ToolBtn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void
    active?: boolean
    title: string
    children: React.ReactNode
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rte-btn ${active ? 'rte-btn-active' : ''}`}
    >
      {children}
    </button>
  )

  return (
    <div className={`rte-wrapper ${error ? 'rte-wrapper-error' : ''}`}>
      {/* ── Toolbar ──────────────────────────────────── */}
      <div className="rte-toolbar">
        {/* Headings */}
        <ToolBtn
          title="Heading 1"
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="w-3.5 h-3.5" />
        </ToolBtn>

        <span className="rte-divider" />

        {/* Inline marks */}
        <ToolBtn
          title="Bold (⌘B)"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Italic (⌘I)"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Underline (⌘U)"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Inline Code"
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="w-3.5 h-3.5" />
        </ToolBtn>

        <span className="rte-divider" />

        {/* Lists */}
        <ToolBtn
          title="Bullet List"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Numbered List"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>

        <span className="rte-divider" />

        {/* Block elements */}
        <ToolBtn
          title="Blockquote"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Code Block"
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Horizontal Rule"
          active={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>

        <span className="rte-divider" />

        {/* Link */}
        <ToolBtn title="Link" active={editor.isActive('link')} onClick={setLink}>
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolBtn>

        <span className="rte-divider" />

        {/* History */}
        <ToolBtn
          title="Undo (⌘Z)"
          active={false}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Redo (⌘⇧Z)"
          active={false}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo className="w-3.5 h-3.5" />
        </ToolBtn>
      </div>

      {/* ── Editor body ──────────────────────────────── */}
      <EditorContent editor={editor} />

      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
