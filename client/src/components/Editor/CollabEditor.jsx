import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { useYjs } from '../../hooks/useYjs'
import { useState, useEffect } from 'react'

// ─── install extra tiptap extensions ────────────────────────────────────────
// npm install @tiptap/extension-placeholder @tiptap/extension-character-count

// ─── theme tokens — mirrors Room.jsx THEMES ──────────────────────────────────
const THEMES = {
  dark: {
    bg: '#0D0D0F',
    surface: '#131316',
    surfaceHover: '#1A1A1F',
    border: '#222228',
    borderStr: '#2E2E38',
    text: '#F0F0F4',
    textMuted: '#7C7C8A',
    textFaint: '#3A3A44',
    accent: '#7C6AF7',
    accentFaint: 'rgba(124,106,247,0.12)',
    accentGlow: 'rgba(124,106,247,0.25)',
    glass: 'rgba(19,19,22,0.92)',
    shadow: '0 8px 32px rgba(0,0,0,0.6)',
    shadowSm: '0 2px 8px rgba(0,0,0,0.35)',
    codeBlock: '#0A0A0C',
    quote: 'rgba(124,106,247,0.2)',
    selection: 'rgba(124,106,247,0.25)',
  },
  light: {
    bg: '#F5F5F7',
    surface: '#FFFFFF',
    surfaceHover: '#F9F9FB',
    border: '#E5E5EA',
    borderStr: '#D1D1D8',
    text: '#18181B',
    textMuted: '#6B6B78',
    textFaint: '#C0C0CC',
    accent: '#6355E8',
    accentFaint: 'rgba(99,85,232,0.08)',
    accentGlow: 'rgba(99,85,232,0.18)',
    glass: 'rgba(255,255,255,0.94)',
    shadow: '0 8px 32px rgba(0,0,0,0.09)',
    shadowSm: '0 2px 8px rgba(0,0,0,0.06)',
    codeBlock: '#F0F0F5',
    quote: 'rgba(99,85,232,0.08)',
    selection: 'rgba(99,85,232,0.18)',
  },
}

// ─── SVG icon ────────────────────────────────────────────────────────────────
const Ico = ({ d, d2, size = 14, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.9} strokeLinecap="round"
    strokeLinejoin="round" style={style}>
    <path d={d} />
    {d2 && <path d={d2} />}
  </svg>
)

const I = {
  bold: 'M6 4h8a4 4 0 010 8H6zM6 12h9a4 4 0 010 8H6z',
  italic: 'M19 4h-9M14 20H5M15 4L9 20',
  strike: 'M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.1 2.4 3.1 3.4l3.3 1.6c.8.4 1.3.7 1.3 1.2 0 .8-1 1.2-2.6 1.2H5M5 20h14M11 4v16',
  h1: 'M4 12h8M4 4v16M12 4v16M17 6.5v11M21.5 8l-4.5-1.5L13 8',
  h2: 'M4 12h8M4 4v16M12 4v16M16 8c0-1.1.9-2 2-2h2a2 2 0 012 2 2 2 0 01-2 2h-2a2 2 0 000 4h4',
  h3: 'M4 12h8M4 4v16M12 4v16M16 8c0-1.1.9-2 2-2h2a2 2 0 012 2 1 1 0 01-2 1h-2m4 0c1.1 0 2 .9 2 2s-.9 2-2 2h-4',
  ul: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  ol: 'M10 6h11M10 12h11M10 18h11M4 6v.01M4 10s0-1 1-1 1 1 1 1-1 2-2 2h2M4 17v-1a1 1 0 011-1h.5M5.5 16A1.5 1.5 0 016 17a1.5 1.5 0 01-1.5 1.5H4',
  quote: 'M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zM15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z',
  code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
  codeBlock: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M10 13l-2 2 2 2M14 17l2-2-2-2',
  hr: 'M3 12h18',
  undo: 'M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 010 11H11',
  redo: 'M15 14l5-5-5-5M19 9H8.5a5.5 5.5 0 000 11H13',
  focus: 'M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M16 21h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3',
  exitFocus: 'M8 3v3a2 2 0 01-2 2H3M21 8h-3a2 2 0 01-2-2V3M3 16h3a2 2 0 012 2v3M16 21v-3a2 2 0 012-2h3',
  paragraph: 'M13 4v16M17 4H9.5a4.5 4.5 0 000 9H13',
  link: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
}

// ─── Toolbar button ───────────────────────────────────────────────────────────
const TBtn = ({ T, active, onClick, title, children, danger }) => {
  const [hov, setHov] = useState(false)
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick() }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={title}
      style={{
        width: 30, height: 30, borderRadius: 7,
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .12s',
        background: active
          ? T.accentFaint
          : hov ? T.surfaceHover : 'transparent',
        color: active
          ? T.accent
          : danger
            ? hov ? '#F87171' : T.textMuted
            : hov ? T.text : T.textMuted,
        boxShadow: active ? `inset 0 0 0 1px ${T.accent}40` : 'none',
      }}>
      {children}
    </button>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
const Div = ({ T }) => (
  <div style={{ width: 1, height: 18, background: T.border, margin: '0 3px', flexShrink: 0 }} />
)

// ─── CollabEditor ─────────────────────────────────────────────────────────────
const CollabEditor = ({ roomId, theme = 'dark' }) => {
  const T = THEMES[theme] ?? THEMES.dark
  const doc = useYjs(roomId)

  const [focused, setFocused] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [wordCount, setWordCount] = useState({ words: 0, chars: 0 })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Collaboration.configure({ document: doc }),
      Placeholder.configure({
        placeholder: 'Start writing — your changes sync in real time…',
      }),
      CharacterCount,
    ],
    editorProps: {
      attributes: { class: 'u2-editor', spellcheck: 'true' },
    },
    onUpdate: ({ editor }) => {
      setWordCount({
        chars: editor.storage.characterCount.characters(),
        words: editor.storage.characterCount.words(),
      })
    },
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  })

  // keyboard shortcut: Escape exits focus mode
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && focusMode) setFocusMode(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [focusMode])

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

    .u2-editor {
      font-family: 'Lora', Georgia, serif;
      font-size: 17px;
      line-height: 1.85;
      color: ${T.text};
      caret-color: ${T.accent};
      outline: none;
      min-height: 420px;
      padding: 2.5rem 3.5rem;
      max-width: 100%;
    }

    .u2-editor::selection,
    .u2-editor *::selection {
      background: ${T.selection};
    }

    .u2-editor p { margin: 0 0 1rem; }
    .u2-editor p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      color: ${T.textFaint};
      pointer-events: none;
      float: left;
      height: 0;
      font-style: italic;
    }

    .u2-editor h1 {
      font-family: 'Lora', Georgia, serif;
      font-size: 2rem; font-weight: 600;
      color: ${T.text}; line-height: 1.3;
      margin: 2rem 0 0.75rem;
      letter-spacing: -.02em;
    }
    .u2-editor h2 {
      font-size: 1.45rem; font-weight: 600;
      color: ${T.text}; line-height: 1.4;
      margin: 1.75rem 0 0.6rem;
      letter-spacing: -.015em;
    }
    .u2-editor h3 {
      font-size: 1.15rem; font-weight: 500;
      color: ${T.text}; line-height: 1.5;
      margin: 1.5rem 0 0.5rem;
    }

    .u2-editor strong { font-weight: 600; color: ${T.text}; }
    .u2-editor em     { font-style: italic; color: ${T.textMuted}; }
    .u2-editor s      { opacity: .5; }

    .u2-editor ul, .u2-editor ol {
      padding-left: 1.6rem; margin: 0.5rem 0 1rem;
    }
    .u2-editor li { margin: 0.25rem 0; }
    .u2-editor li::marker { color: ${T.accent}; }

    .u2-editor blockquote {
      border-left: 3px solid ${T.accent};
      margin: 1.25rem 0;
      padding: 0.6rem 1.2rem;
      background: ${T.quote};
      border-radius: 0 6px 6px 0;
      font-style: italic;
      color: ${T.textMuted};
    }

    .u2-editor code {
      font-family: 'DM Mono', monospace;
      font-size: .85em;
      background: ${T.codeBlock};
      color: ${T.accent};
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid ${T.border};
    }

    .u2-editor pre {
      background: ${T.codeBlock};
      border: 1px solid ${T.border};
      border-radius: 10px;
      padding: 1.2rem 1.5rem;
      margin: 1.25rem 0;
      overflow-x: auto;
    }
    .u2-editor pre code {
      background: none; border: none;
      padding: 0; font-size: .9em;
      color: ${T.text};
    }

    .u2-editor hr {
      border: none;
      border-top: 1px solid ${T.border};
      margin: 2rem 0;
    }

    /* Yjs collaboration cursor */
    .collaboration-cursor__caret {
      position: relative;
      border-left: 2px solid;
      margin-left: -1px;
      word-break: normal;
      pointer-events: none;
    }
    .collaboration-cursor__label {
      position: absolute; top: -1.5em; left: -1px;
      font-family: 'DM Sans', sans-serif;
      font-size: 11px; font-weight: 500;
      padding: 2px 7px; border-radius: 4px;
      white-space: nowrap; color: #fff;
      pointer-events: none; user-select: none;
    }
  `

  if (!editor) return null

  return (
    <>
      <style>{css}</style>

      <div style={{
        position: focusMode ? 'fixed' : 'relative',
        inset: focusMode ? 0 : 'auto',
        zIndex: focusMode ? 200 : 'auto',
        display: 'flex',
        flexDirection: 'column',
        height: focusMode ? '100vh' : '100%',
        background: T.bg,
        transition: 'all .3s cubic-bezier(.4,0,.2,1)',
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* ── Toolbar ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '6px 12px', gap: 2,
          background: T.glass,
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${focused ? T.borderStr : T.border}`,
          flexWrap: 'wrap',
          transition: 'border-color .2s',
          position: 'sticky', top: 0, zIndex: 10,
          flexShrink: 0,
        }}>

          {/* Text style */}
          <TBtn T={T} active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (⌘B)">
            <Ico d={I.bold} />
          </TBtn>
          <TBtn T={T} active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (⌘I)">
            <Ico d={I.italic} />
          </TBtn>
          <TBtn T={T} active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough">
            <Ico d={I.strike} />
          </TBtn>
          <TBtn T={T} active={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Inline code">
            <Ico d={I.code} />
          </TBtn>

          <Div T={T} />

          {/* Headings */}
          <TBtn T={T} active={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1">
            <Ico d={I.h1} />
          </TBtn>
          <TBtn T={T} active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2">
            <Ico d={I.h2} />
          </TBtn>
          <TBtn T={T} active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3">
            <Ico d={I.h3} />
          </TBtn>
          <TBtn T={T} active={editor.isActive('paragraph')}
            onClick={() => editor.chain().focus().setParagraph().run()}
            title="Paragraph">
            <Ico d={I.paragraph} />
          </TBtn>

          <Div T={T} />

          {/* Lists + blocks */}
          <TBtn T={T} active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list">
            <Ico d={I.ul} />
          </TBtn>
          <TBtn T={T} active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered list">
            <Ico d={I.ol} />
          </TBtn>
          <TBtn T={T} active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Block quote">
            <Ico d={I.quote} />
          </TBtn>
          <TBtn T={T} active={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code block">
            <Ico d={I.codeBlock} />
          </TBtn>
          <TBtn T={T} active={false}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Divider">
            <Ico d={I.hr} />
          </TBtn>

          <Div T={T} />

          {/* History */}
          <TBtn T={T} active={false}
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo (⌘Z)">
            <Ico d={I.undo} />
          </TBtn>
          <TBtn T={T} active={false}
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo (⌘⇧Z)">
            <Ico d={I.redo} />
          </TBtn>

          <div style={{ flex: 1 }} />

          {/* Word count */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '3px 10px',
            borderRadius: 6,
            background: T.surfaceHover,
            border: `1px solid ${T.border}`,
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            color: T.textMuted,
            letterSpacing: '.02em',
            marginRight: 4,
          }}>
            <span>{wordCount.words} <span style={{ color: T.textFaint }}>w</span></span>
            <div style={{ width: 1, height: 10, background: T.border }} />
            <span>{wordCount.chars} <span style={{ color: T.textFaint }}>c</span></span>
          </div>

          {/* Focus mode toggle */}
          <TBtn T={T} active={focusMode}
            onClick={() => setFocusMode(f => !f)}
            title={focusMode ? 'Exit focus mode (Esc)' : 'Focus mode'}>
            <Ico d={focusMode ? I.exitFocus : I.focus} />
          </TBtn>
        </div>

        {/* ── Editor area ── */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          background: T.bg,
          position: 'relative',
        }}>
          {/* Centered column */}
          <div style={{
            maxWidth: focusMode ? 720 : 820,
            margin: '0 auto',
            minHeight: '100%',
            background: T.surface,
            boxShadow: T.shadow,
            borderLeft: `1px solid ${T.border}`,
            borderRight: `1px solid ${T.border}`,
            transition: 'max-width .3s cubic-bezier(.4,0,.2,1)',
          }}>

            {/* Accent top bar — glows when focused */}
            <div style={{
              height: 2,
              background: focused
                ? `linear-gradient(90deg, ${T.accent}, ${T.accentGlow}, ${T.accent})`
                : 'transparent',
              transition: 'background .4s ease',
            }} />

            <EditorContent editor={editor} />

            {/* Bottom padding */}
            <div style={{ height: '30vh' }} />
          </div>
        </div>

        {/* ── Status bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '5px 16px',
          background: T.glass,
          backdropFilter: 'blur(12px)',
          borderTop: `1px solid ${T.border}`,
          fontSize: 11,
          fontFamily: "'DM Mono', monospace",
          color: T.textFaint,
          flexShrink: 0,
        }}>
          {/* Live sync dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#34D399',
              boxShadow: '0 0 6px rgba(52,211,153,0.5)',
              animation: 'syncpulse 2.4s ease-in-out infinite',
            }} />
            <span style={{ color: '#34D399', fontWeight: 500 }}>live sync</span>
          </div>

          <div style={{ width: 1, height: 10, background: T.border }} />
          <span>Markdown shortcuts supported</span>
          <div style={{ flex: 1 }} />

          {focusMode && (
            <span style={{ color: T.textMuted }}>
              esc to exit focus mode
            </span>
          )}

          <span style={{ color: T.textMuted }}>
            {editor.isActive('bold') && 'Bold · '}
            {editor.isActive('italic') && 'Italic · '}
            {editor.isActive('heading', { level: 1 }) && 'H1 · '}
            {editor.isActive('heading', { level: 2 }) && 'H2 · '}
            {editor.isActive('heading', { level: 3 }) && 'H3 · '}
            {editor.isActive('bulletList') && 'List · '}
            {editor.isActive('blockquote') && 'Quote · '}
            {editor.isActive('codeBlock') && 'Code · '}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes syncpulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: .5; transform: scale(.85); }
        }
      `}</style>
    </>
  )
}

export default CollabEditor