'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useCallback } from 'react'

interface BlogEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function BlogEditor({ value, onChange, placeholder = 'Write your post…' }: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'editor-link' },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      handlePaste(view, event) {
        // Handle pasted images
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile()
            if (!file) continue
            const reader = new FileReader()
            reader.onload = (e) => {
              const src = e.target?.result as string
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src })
                )
              )
            }
            reader.readAsDataURL(file)
            return true
          }
        }
        return false
      },
    },
  })

  // Sync external value changes (e.g. loading a post for edit)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [value]) // eslint-disable-line

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href
    const url = window.prompt('Enter URL:', prev ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

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
      onClick={onClick}
      title={title}
      className={`editor-tool-btn${active ? ' active' : ''}`}
    >
      {children}
    </button>
  )

  return (
    <div className="blog-editor-wrap">
      <style>{`
        .blog-editor-wrap {
          border: 1px solid #ddd;
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
        }
        .blog-editor-wrap:focus-within { border-color: #0066ff; }

        .editor-toolbar {
          display: flex;
          gap: 2px;
          padding: 8px 10px;
          border-bottom: 1px solid #eee;
          background: #fafafa;
          flex-wrap: wrap;
        }
        .editor-tool-btn {
          background: none;
          border: none;
          border-radius: 5px;
          padding: 5px 8px;
          font-size: 0.85rem;
          cursor: pointer;
          color: #444;
          font-weight: 500;
          line-height: 1;
          transition: background 0.1s, color 0.1s;
          min-width: 28px;
          text-align: center;
        }
        .editor-tool-btn:hover { background: #e8edf5; }
        .editor-tool-btn.active { background: #dbeafe; color: #1d4ed8; }
        .editor-toolbar-sep {
          width: 1px;
          background: #e5e7eb;
          margin: 4px 4px;
          align-self: stretch;
        }

        .editor-content-area {
          min-height: 300px;
          max-height: 70vh;
          overflow-y: auto;
          resize: vertical;
        }
        .ProseMirror {
          padding: 16px 18px;
          min-height: 300px;
          outline: none;
          font-size: 0.97rem;
          line-height: 1.75;
          color: #222;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #aaa;
          pointer-events: none;
          float: left;
          height: 0;
        }
        .ProseMirror h1 { font-size: 1.8rem; font-weight: 700; margin: 1.2em 0 0.4em; }
        .ProseMirror h2 { font-size: 1.4rem; font-weight: 700; margin: 1.2em 0 0.4em; }
        .ProseMirror h3 { font-size: 1.1rem; font-weight: 700; margin: 1em 0 0.3em; }
        .ProseMirror p { margin: 0 0 0.8em; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.4em; margin: 0 0 0.8em; }
        .ProseMirror li { margin-bottom: 0.2em; }
        .ProseMirror strong { font-weight: 700; }
        .ProseMirror em { font-style: italic; }
        .ProseMirror a.editor-link { color: #0066ff; text-decoration: underline; cursor: pointer; }
        .ProseMirror blockquote {
          border-left: 3px solid #d1d5db;
          padding-left: 1em;
          color: #666;
          margin: 1em 0;
          font-style: italic;
        }
        .ProseMirror code {
          background: #f3f4f6;
          padding: 1px 5px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
        }
        .ProseMirror pre {
          background: #f3f4f6;
          padding: 12px 16px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 1em 0;
        }
        .ProseMirror pre code { background: none; padding: 0; }
        .ProseMirror img {
          max-width: 100%;
          border-radius: 6px;
          margin: 0.5em 0;
          cursor: default;
        }
        .ProseMirror img.ProseMirror-selectednode { outline: 2px solid #0066ff; }
        .ProseMirror hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5em 0; }
      `}</style>

      <div className="editor-toolbar">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
          <em>I</em>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <s>S</s>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
          {'<>'}
        </ToolBtn>

        <div className="editor-toolbar-sep" />

        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          H2
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          H3
        </ToolBtn>

        <div className="editor-toolbar-sep" />

        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          • —
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
          1 —
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          ❝
        </ToolBtn>

        <div className="editor-toolbar-sep" />

        <ToolBtn onClick={setLink} active={editor.isActive('link')} title="Add / remove link">
          🔗
        </ToolBtn>
        <ToolBtn
          onClick={() => {
            const url = window.prompt('Image URL:')
            if (url) editor.chain().focus().setImage({ src: url }).run()
          }}
          title="Insert image by URL"
          active={false}
        >
          🖼
        </ToolBtn>

        <div className="editor-toolbar-sep" />

        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule" active={false}>
          —
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)" active={false}>
          ↩
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)" active={false}>
          ↪
        </ToolBtn>
      </div>

      <div className="editor-content-area">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
