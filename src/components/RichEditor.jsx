import { useEditor, EditorContent } from '@tiptap/react'
import { useEffect, useMemo, useState } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import { Extension } from '@tiptap/core'

// 간단한 아이콘 컴포넌트들 (인라인 SVG)
const Icon = {
  Bold: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 15H9v4H6V5h7a4 4 0 0 1 0 8Zm-4.5-3h4a2 2 0 0 0 0-4H9v4Zm9 7h-4v-3h4v3Z"/>
    </svg>
  ),
  Italic: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M10 5h9v3h-3.9l-3.2 8H19v3H5v-3h4.1l3.2-8H10V5Z"/>
    </svg>
  ),
  Underline: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7 3h3v8a2 2 0 1 0 4 0V3h3v8a5 5 0 1 1-10 0V3Zm-2 18h14v-2H5v2Z"/>
    </svg>
  ),
  Strike: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M4 10h16v2H4v-2Zm9.5 3.2c1.2.5 2.5 1.2 2.5 2.9 0 2-1.9 3.4-5 3.4-2.3 0-4.1-.8-5.1-1.8l1.6-1.6c.7.7 2 1.4 3.6 1.4 1.6 0 2.7-.6 2.7-1.6 0-.8-.7-1.2-1.9-1.7l1.6-1Zm-7-6.8C7.4 4.6 9 4 11 4c2.8 0 5 1.3 5.9 3.1l-2.2 1.1C14.1 6.9 12.8 6 11 6 9.8 6 8.9 6.3 8.3 6.8L6.5 5.4Z"/>
    </svg>
  ),
  UL: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7 5h14v2H7V5Zm0 6h14v2H7v-2Zm0 6h14v2H7v-2ZM3 5h2v2H3V5Zm0 6h2v2H3v-2Zm0 6h2v2H3v-2Z"/>
    </svg>
  ),
  OL: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7 5h14v2H7V5Zm0 6h14v2H7v-2Zm0 6h14v2H7v-2ZM5 7H3V5h2V3h2v6H5V7Zm0 8H3v-2h2v-1H3v-2h4v5H5v0Zm0 4h2v2H3v-2h2v-1H3v-2h4v3H5v0Z"/>
    </svg>
  ),
  Table: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 3h18v18H3V3Zm8 2H5v4h6V5Zm8 0h-6v4h6V5ZM5 11v4h6v-4H5Zm8 0v4h6v-4h-6ZM5 17v4h6v-4H5Zm8 0v4h6v-4h-6Z"/>
    </svg>
  ),
  PlusCol: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M11 3h2v18h-2V3Zm4 8h6v2h-6v6h-2v-6H7v-2h6V5h2v6Z"/>
    </svg>
  ),
  PlusRow: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 11h18v2H3v-2Zm8-4V1h2v6h6v2h-6v6h-2V9H5V7h6Z"/>
    </svg>
  ),
  DeleteTable: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 3h18v18H3V3Zm2 2v4h6V5H5Zm8 0v4h6V5h-6ZM5 11v4h6v-4H5Zm8 0v4h6v-4h-6ZM5 17v2h14v-2H5Zm2.7-8.7 1.4-1.4L12 9.4l2.9-2.9 1.4 1.4L13.4 10.8l2.9 2.9-1.4 1.4L12 12.2l-2.9 2.9-1.4-1.4 2.9-2.9-2.9-2.9Z"/>
    </svg>
  ),
  Undo: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7 7V3L1 9l6 6v-4h5a5 5 0 0 1 0 10h-1v-2h1a3 3 0 1 0 0-6H7V7Z"/>
    </svg>
  ),
  Redo: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17 7V3l6 6-6 6v-4h-5a5 5 0 1 0 0 10h1v-2h-1a3 3 0 1 1 0-6h5V7Z"/>
    </svg>
  ),
  AlignLeft: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 5h18v2H3V5Zm0 4h12v2H3V9Zm0 4h18v2H3v-2Zm0 4h12v2H3v-2Z"/>
    </svg>
  ),
  AlignCenter: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 5h18v2H3V5Zm3 4h12v2H6V9Zm-3 4h18v2H3v-2Zm3 4h12v2H6v-2Z"/>
    </svg>
  ),
  AlignRight: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 5h18v2H3V5Zm6 4h12v2H9V9ZM3 13h18v2H3v-2Zm6 4h12v2H9v-2Z"/>
    </svg>
  ),
  AlignJustify: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 5h18v2H3V5Zm0 4h18v2H3V9Zm0 4h18v2H3v-2Zm0 4h18v2H3v-2Z"/>
    </svg>
  ),
  Code: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8.6 16.6 4 12l4.6-4.6L10 8.8 6.8 12 10 15.2l-1.4 1.4Zm6.8 0L14 15.2 17.2 12 14 8.8 15.4 7.4 20 12l-4.6 4.6ZM13.7 4l-3.4 16-2-.4L11.7 3.6l2 .4Z"/>
    </svg>
  ),
}

export default function RichEditor({
  theme = 'dark',
  minHeight = 280,
  maxHeight = 700,
  height,
  resizable = true,
  className = '',
  showHeader = true,
  placeholder = '여기에 내용을 입력하세요…',
  allowTextAlign = true,
  defaultTextAlign = 'left',
  showFontSize = true,
  fontSizes = [12, 14, 16, 18, 20, 24, 28, 32],
  defaultFontSize,
  // 표 열 리사이즈 허용 여부
  columnResizable = true,
  // 행 높이 설정 UI
  showRowHeight = true,
  rowHeights = [24, 32, 40, 48, 60],
  defaultRowHeight,
  // HTML 보기/편집 토글
  showHtmlToggle = true,
  allowHtmlEdit = true,
  // HTML 소스 정렬(Beautify)
  showHtmlFormat = false,
  autoFormatHtmlOnOpen = true,
  autoFormatHtmlOnApply = false,
  htmlFormatOptions = { printWidth: 100, tabWidth: 2, useTabs: false },
} = {}) {
  // FontSize Extension: map textStyle.mark attribute -> inline style font-size
  const FontSize = useMemo(() => Extension.create({
    name: 'fontSizeBridge',
    addGlobalAttributes() {
      return [
        {
          types: ['textStyle'],
          attributes: {
            fontSize: {
              default: null,
              renderHTML: attributes => {
                if (!attributes.fontSize) return {}
                return { style: `font-size: ${attributes.fontSize}` }
              },
              parseHTML: element => ({ fontSize: element.style.fontSize || null }),
            },
          },
        },
      ]
    },
  }), [] )

  // RowHeight Extension: apply min-height style to all cells in the current row
  const RowHeight = useMemo(() => Extension.create({
    name: 'rowHeight',
    addGlobalAttributes() {
      return [
        {
          types: ['tableCell', 'tableHeader'],
          attributes: {
            rowMinHeight: {
              default: null,
              renderHTML: attrs => {
                if (!attrs.rowMinHeight) return {}
                const v = String(attrs.rowMinHeight)
                const px = /px$/i.test(v) ? v : `${v}px`
                return { style: `min-height: ${px}` }
              },
              parseHTML: element => ({ rowMinHeight: element.style?.minHeight || null }),
            },
          },
        },
      ]
    },
    addCommands() {
      return {
        setRowMinHeight:
          (value) => ({ state, dispatch }) => {
            const { selection } = state
            const $from = selection.$from
            // find parent tableRow
            for (let d = $from.depth; d > 0; d--) {
              const node = $from.node(d)
              if (node.type.name === 'tableRow') {
                const rowPos = $from.before(d)
                const rowNode = state.doc.nodeAt(rowPos)
                if (!rowNode) return false
                const tr = state.tr
                let pos = rowPos + 1 // first child of row
                const v = value == null || value === '' ? null : (/px$/i.test(String(value)) ? String(value) : `${value}px`)
                for (let i = 0; i < rowNode.childCount; i++) {
                  const cell = rowNode.child(i)
                  const attrs = { ...cell.attrs, rowMinHeight: v }
                  tr.setNodeMarkup(pos, cell.type, attrs, cell.marks)
                  pos += cell.nodeSize
                }
                if (tr.docChanged && dispatch) dispatch(tr)
                return true
              }
            }
            return false
          },
      }
    },
  }), [])

  const [isDark, setIsDark] = useState(theme === 'dark')
  const [fontSizeValue, setFontSizeValue] = useState('')
  const [rowHeightValue, setRowHeightValue] = useState('') // e.g., '40px' or ''
  const [isHtmlView, setIsHtmlView] = useState(false)
  const [htmlSource, setHtmlSource] = useState('')
  const [isFormatting, setIsFormatting] = useState(false)
  const prettierRef = useMemo(() => ({ loaded: false, prettier: null, plugins: null }), [])
  
  // HTML 소스 정렬 기능 (Prettier를 동적 로딩)
  async function formatHtmlSource() {
    try {
      setIsFormatting(true)
      // Lazy-load prettier only when needed
      if (!prettierRef.loaded) {
        // 일부 환경(Vite/Windows)에서는 .mjs 경로 지정이 필요할 수 있음
        let prettierMod
        let htmlPluginMod
        try {
          prettierMod = await import('prettier/standalone.mjs')
        } catch (_) {
          // fallback: 확장자 없는 경로
          prettierMod = await import('prettier/standalone')
        }
        try {
          htmlPluginMod = await import('prettier/plugins/html.mjs')
        } catch (_) {
          htmlPluginMod = await import('prettier/plugins/html')
        }

        const format = prettierMod.format || (prettierMod.default && prettierMod.default.format)
        const pluginHtml = htmlPluginMod.default ?? htmlPluginMod

        if (!format) throw new Error('Prettier format function not found')

        prettierRef.prettier = { format }
        // Prettier는 plugins 배열에 플러그인 객체들을 담아야 함
        prettierRef.plugins = [pluginHtml]
        prettierRef.loaded = true
      }
      const src = htmlSource ?? ''
      const opts = {
        parser: 'html',
        plugins: prettierRef.plugins,
        printWidth: htmlFormatOptions?.printWidth ?? 100,
        tabWidth: htmlFormatOptions?.tabWidth ?? 2,
        useTabs: htmlFormatOptions?.useTabs ?? false,
        htmlWhitespaceSensitivity: htmlFormatOptions?.htmlWhitespaceSensitivity ?? 'css',
        bracketSameLine: htmlFormatOptions?.bracketSameLine ?? false,
      }
      const formatted = await prettierRef.prettier.format(src, opts)
      setHtmlSource(formatted)
    } catch (e) {
      console.warn('[RichEditor] HTML format failed:', e)
    } finally {
      setIsFormatting(false)
    }
  }
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      TextStyle,
      FontSize,
      RowHeight,
      // TipTap Table: resizable=true 면 열 경계를 드래그하여 너비 조절 가능
      Table.configure({ resizable: !!columnResizable }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '<p>TipTap 예제입니다. 아래 툴바를 이용해 표를 삽입해 보세요.</p>',
    onCreate: ({ editor }) => {
      // 기본 정렬 적용
      try {
        editor.chain().setTextAlign(defaultTextAlign).run()
      } catch (_) {
        // 무시: 지원하지 않는 값일 경우 안전하게 패스
      }
      // 기본 글자 크기 적용(옵션)
      if (defaultFontSize) {
        const sizeVal = typeof defaultFontSize === 'number' ? `${defaultFontSize}px` : String(defaultFontSize)
        editor.chain().focus().setMark('textStyle', { fontSize: sizeVal }).run()
        // 초기 셀렉트 표시값 동기화
        setFontSizeValue(/px$/.test(sizeVal) ? sizeVal : `${sizeVal}px`)
      }
      // 기본 행 높이 적용(옵션, 표 내부에서 의미 있음)
      if (defaultRowHeight != null && defaultRowHeight !== '') {
        const rh = typeof defaultRowHeight === 'number' ? `${defaultRowHeight}px` : String(defaultRowHeight)
        // 현재 커서가 표 안이 아닐 수 있으므로, 적용은 사용자가 표 셀에 포커스했을 때 진행하는 편이 안전함
        // 여기서는 초기 셀렉트 값만 세팅
        setRowHeightValue(/px$/i.test(rh) ? rh : `${rh}px`)
      }
    },
  })

  // 현재 커서/선택의 글자 크기를 셀렉트에 동기화
  useEffect(() => {
    if (!editor) return

    const normalize = (v) => {
      if (!v) return ''
      const trimmed = String(v).trim()
      if (trimmed === '') return ''
      return /px$/i.test(trimmed) ? trimmed : `${trimmed}px`
    }

    const updateFromSelection = () => {
      try {
        const attrs = editor.getAttributes('textStyle') || {}
        setFontSizeValue(normalize(attrs.fontSize))
        // Row height: read current row's common value (if all cells share same rowMinHeight)
        const { state } = editor
        const $from = state.selection.$from
        let value = ''
        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d)
          if (node.type.name === 'tableRow') {
            const rowPos = $from.before(d)
            const rowNode = state.doc.nodeAt(rowPos)
            if (rowNode) {
              let same = undefined
              for (let i = 0; i < rowNode.childCount; i++) {
                const cell = rowNode.child(i)
                const v = cell?.attrs?.rowMinHeight || ''
                if (same === undefined) same = v
                else if (same !== v) { same = '' ; break }
              }
              value = same || ''
            }
            break
          }
        }
        setRowHeightValue(normalize(value))
      } catch {
        setFontSizeValue('')
        setRowHeightValue('')
      }
    }

    updateFromSelection()
    editor.on('selectionUpdate', updateFromSelection)
    editor.on('transaction', updateFromSelection)
    editor.on('update', updateFromSelection)

    return () => {
      editor.off('selectionUpdate', updateFromSelection)
      editor.off('transaction', updateFromSelection)
      editor.off('update', updateFromSelection)
    }
  }, [editor])

  const contentStyle = useMemo(() => ({
    minHeight: typeof minHeight === 'number' ? `${minHeight}px` : String(minHeight),
    maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : String(maxHeight),
    height: height != null ? (typeof height === 'number' ? `${height}px` : String(height)) : undefined,
    resize: resizable ? 'vertical' : 'none',
    overflow: 'auto',
  }), [minHeight, maxHeight, height, resizable])

  return (
    <div className={`tiptap-wrap ${isDark ? 'dark' : 'light'} ${className}`}>
      {/* 컴포넌트 로컬 스타일: 다크/라이트 테마 대비 향상 */}
      <style>{`
        .tiptap-wrap { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
        .tiptap-wrap .rte { border: 1px solid; border-radius: 10px; overflow: hidden; transition: box-shadow .15s, border-color .15s, background .15s; }
        .tiptap-wrap .rte:focus-within { box-shadow: 0 0 0 3px rgba(107,156,255,.25); }
        .tiptap-wrap .toolbar { display: flex; gap: 4px; flex-wrap: wrap; padding: 6px; align-items: center; }
        .tiptap-wrap .toolbar .spacer { flex: 1 1 auto; }
        .tiptap-wrap .toolbar .divider { width: 1px; align-self: stretch; opacity: .15; margin: 0 6px; }
        .tiptap-wrap.light { color: #111; }
        .tiptap-wrap.dark { color: #eee; }
        .tiptap-wrap.light .rte { border-color: #ddd; background: #fafafa; }
        .tiptap-wrap.dark .rte { border-color: #333; background: #1a1a1a; }
        .tiptap-wrap .toolbar .btn { height: 30px; width: 30px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; border: 1px solid; cursor: pointer; line-height: 0; }
        /* 아이콘(SVG)이 보이지 않는 경우를 대비해 명시적으로 크기/색 지정 */
        .tiptap-wrap .toolbar .btn svg { width: 18px; height: 18px; color: inherit; fill: currentColor; display: block; flex-shrink: 0; }
        .tiptap-wrap .toolbar .btn.wide { width: auto; padding: 0 8px; line-height: 1; gap: 6px; }
        .tiptap-wrap.light .toolbar .btn { background: #fff; color: #111; border-color: #ddd; }
        .tiptap-wrap.dark .toolbar .btn { background: #222; color: #eee; border-color: #444; }
        .tiptap-wrap .toolbar .btn:hover { filter: brightness(1.06); }
        .tiptap-wrap .toolbar .btn.active { outline: 2px solid #6b9cff33; }
        .tiptap-wrap .toolbar .btn:disabled { opacity: .5; cursor: not-allowed; }
        .tiptap-wrap .toolbar .select { height: 30px; border-radius: 6px; border: 1px solid; padding: 0 8px; background: transparent; }
        .tiptap-wrap.light .toolbar .select { background: #fff; color: #111; border-color: #ddd; }
        .tiptap-wrap.dark .toolbar .select { background: #222; color: #eee; border-color: #444; }
        /* 시각적 숨김(스크린 리더용) */
        .tiptap-wrap .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
        /* 헤더 스트립 */
        .tiptap-wrap .header { padding: 8px 12px; font-size: 12px; opacity: .9; display: flex; align-items: center; gap: 8px; }
        .tiptap-wrap.light .header { background: #f3f3f3; border-bottom: 1px solid #e5e5e5; color: #333; }
        .tiptap-wrap.dark .header { background: #151515; border-bottom: 1px solid #2a2a2a; color: #ddd; }
        .tiptap-wrap .editor { padding: 12px; text-align: left; }
        .tiptap-wrap .editor .ProseMirror { outline: none; text-align: left; }
        .tiptap-wrap.light .editor { background: #fff; }
        .tiptap-wrap.dark .editor { background: #111; }
        /* 표 가시성 및 리사이즈 개선 */
        .tiptap-wrap .editor table { border-collapse: collapse; width: 100%; table-layout: fixed; }
        .tiptap-wrap.light .editor th, .tiptap-wrap.light .editor td { border: 1px solid #ddd; }
        .tiptap-wrap.dark .editor th, .tiptap-wrap.dark .editor td { border: 1px solid #444; }
        .tiptap-wrap .editor th, .tiptap-wrap .editor td { padding: 6px; position: relative; }
        /* td/th의 min-height가 잘 드러나도록 높이 자동화(명시 height 제거) */
        .tiptap-wrap .editor th, .tiptap-wrap .editor td { height: auto; }
        /* ProseMirror column resize handle */
        .tiptap-wrap .editor .ProseMirror .column-resize-handle { position: absolute; right: -2px; top: 0; bottom: 0; width: 6px; z-index: 2; cursor: col-resize; }
        .tiptap-wrap.light .editor .ProseMirror .column-resize-handle { background: transparent; }
        .tiptap-wrap.dark .editor .ProseMirror .column-resize-handle { background: transparent; }
        .tiptap-wrap .editor .ProseMirror .column-resize-handle:hover { background: rgba(107,156,255,0.35); }
        .tiptap-wrap .editor .ProseMirror.resize-cursor, .tiptap-wrap .editor .ProseMirror .resize-cursor { cursor: col-resize; }
        /* 기본 텍스트 대비 */
        .tiptap-wrap.dark .editor { color: #eee; }
        .tiptap-wrap.light .editor { color: #111; }
        /* Placeholder 색상 보정 */
        .tiptap-wrap .editor .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #9aa0a6; pointer-events: none; height: 0; }
        /* HTML 소스 보기 영역 */
        .tiptap-wrap .html-view { padding: 12px; }
        .tiptap-wrap .html-view textarea { width: 100%; box-sizing: border-box; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; font-size: 12px; line-height: 1.5; border-radius: 6px; border: 1px solid; padding: 10px; height: 100%; min-height: 160px; resize: vertical; }
        .tiptap-wrap.light .html-view textarea { background: #fff; color: #111; border-color: #ddd; }
        .tiptap-wrap.dark .html-view textarea { background: #111; color: #eee; border-color: #444; }
      `}</style>
      <div className="rte">
        {showHeader && (
          <div className="header" aria-hidden="true">
            <span>편집 영역</span>
          </div>
        )}
        <div className="toolbar" role="toolbar" aria-label="Rich text editor toolbar">
          <button className="btn" title="테마 전환" aria-label="Toggle theme" onClick={() => setIsDark((v) => !v)}>
            {isDark ? '🌙' : '☀️'}
          </button>
          <span className="divider" />
          {showHtmlToggle && (
            <button
              className={`btn ${isHtmlView ? 'active' : ''}`}
              title={isHtmlView ? 'WYSIWYG로 돌아가기' : 'HTML 보기'}
              aria-label={isHtmlView ? 'Switch to WYSIWYG view' : 'Switch to HTML view'}
              onClick={async () => {
                if (!editor) return
                if (!isHtmlView) {
                  // 진입: 에디터의 현재 HTML을 로드
                  try { setHtmlSource(editor.getHTML()) } catch { setHtmlSource('') }
                  setIsHtmlView(true)
                  if (autoFormatHtmlOnOpen) {
                    // 소스 보기 진입 직후 자동 정렬(읽기 전용 모드여도 보기용 정렬은 수행)
                    await formatHtmlSource()
                  }
                } else {
                  // 복귀: 수정된 HTML을 적용(편집 허용 시)
                  if (allowHtmlEdit) {
                    let sourceToApply = htmlSource
                    if (autoFormatHtmlOnApply) {
                      await formatHtmlSource()
                      sourceToApply = htmlSource
                    }
                    try {
                      editor.commands.setContent(sourceToApply || '', false)
                      setIsHtmlView(false)
                    } catch (e) {
                      console.warn('[RichEditor] setContent failed, stay in HTML view:', e)
                      // 적용 실패 시 HTML 보기 유지
                    }
                  } else {
                    setIsHtmlView(false)
                  }
                }
              }}
              disabled={!editor || isFormatting}
            >
              <Icon.Code />
            </button>
          )}
          {showHtmlFormat && (
            <button
              className={`btn wide ${isHtmlView ? '' : 'disabled'}`}
              title="소스 정렬 (Ctrl/Cmd+Shift+F)"
              aria-label="Format HTML source"
              onClick={async () => { if (isHtmlView && allowHtmlEdit) await formatHtmlSource() }}
              disabled={!isHtmlView || !allowHtmlEdit || isFormatting}
            >
              {/* 간단한 마법봉 아이콘 */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11 2 9.6 3.4 11 4.8 12.4 3.4 11 2Zm6 1-1.4 1.4L17 5.8l1.4-1.4L17 3Zm-12 0L3 5l1.4 1.4L6.4 4.4 5 3Zm13.6 5.2-1.4-1.4-14 14 1.4 1.4 14-14Z"/></svg>
              <span style={{ fontSize: 12 }}>정렬</span>
            </button>
          )}
          <span className="divider" />
          {allowTextAlign && (
            <>
              <button
                className={`btn ${editor?.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
                title="왼쪽 정렬"
                aria-label="Align left"
                onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                disabled={!editor || isHtmlView}
              >
                <Icon.AlignLeft />
              </button>
              <button
                className={`btn ${editor?.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
                title="가운데 정렬"
                aria-label="Align center"
                onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                disabled={!editor || isHtmlView}
              >
                <Icon.AlignCenter />
              </button>
              <button
                className={`btn ${editor?.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
                title="오른쪽 정렬"
                aria-label="Align right"
                onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                disabled={!editor || isHtmlView}
              >
                <Icon.AlignRight />
              </button>
              <button
                className={`btn ${editor?.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}
                title="양쪽 맞춤"
                aria-label="Align justify"
                onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
                disabled={!editor || isHtmlView}
              >
                <Icon.AlignJustify />
              </button>
              <span className="divider" />
            </>
          )}
            {showFontSize && (
              <>
                <label htmlFor="font-size" className="sr-only">Font size</label>
                <select
                  id="font-size"
                  className="select"
                  title="글자 크기"
                  aria-label="Font size"
                  onChange={(e) => {
                    const v = e.target.value
                    if (!v) {
                      editor?.chain().focus().unsetMark('textStyle').run()
                      setFontSizeValue('')
                    } else {
                      const sizeVal = /px$/i.test(v) ? v : `${v}px`
                      editor?.chain().focus().setMark('textStyle', { fontSize: sizeVal }).run()
                      setFontSizeValue(sizeVal)
                    }
                  }}
                  value={fontSizeValue}
                  disabled={!editor || isHtmlView}
                >
                  <option value="">기본</option>
                  {fontSizes.map((s) => (
                    <option key={s} value={`${s}px`}>{s}px</option>
                  ))}
                </select>
                <span className="divider" />
              </>
            )}
            {showRowHeight && (
              <>
                <label htmlFor="row-height" className="sr-only">Row height</label>
                <select
                  id="row-height"
                  className="select"
                  title="행 높이(선택된 행)"
                  aria-label="Row height (selected row)"
                  onChange={(e) => {
                    const v = e.target.value
                    if (!editor) return
                    if (!v) {
                      editor.chain().focus().setRowMinHeight('').run()
                      setRowHeightValue('')
                    } else {
                      const px = /px$/i.test(v) ? v : `${v}px`
                      editor.chain().focus().setRowMinHeight(px).run()
                      setRowHeightValue(px)
                    }
                  }}
                  value={rowHeightValue}
                  disabled={!editor || isHtmlView}
                >
                  <option value="">행 높이: 기본</option>
                  {rowHeights.map((h) => (
                    <option key={h} value={`${h}px`}>{h}px</option>
                  ))}
                </select>
                <span className="divider" />
              </>
            )}
            <button
              className={`btn ${editor?.isActive('bold') ? 'active' : ''}`}
              title="굵게"
              aria-label="Bold"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              disabled={!editor || isHtmlView}
            >
              <Icon.Bold />
            </button>
            <button
              className={`btn ${editor?.isActive('italic') ? 'active' : ''}`}
              title="기울임"
              aria-label="Italic"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              disabled={!editor || isHtmlView}
            >
              <Icon.Italic />
            </button>
            <button
              className={`btn ${editor?.isActive('underline') ? 'active' : ''}`}
              title="밑줄"
              aria-label="Underline"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              disabled={!editor || isHtmlView}
            >
              <Icon.Underline />
            </button>
            <button
              className={`btn ${editor?.isActive('strike') ? 'active' : ''}`}
              title="취소선"
              aria-label="Strikethrough"
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              disabled={!editor || isHtmlView}
            >
              <Icon.Strike />
            </button>
            <button
              className={`btn ${editor?.isActive('bulletList') ? 'active' : ''}`}
              title="글머리 기호"
              aria-label="Bullet list"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              disabled={!editor || isHtmlView}
            >
              <Icon.UL />
            </button>
          <button
            className={`btn ${editor?.isActive('orderedList') ? 'active' : ''}`}
            title="번호 목록"
            aria-label="Ordered list"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            disabled={!editor || isHtmlView}
          >
            <Icon.OL />
          </button>
          <span className="divider" />
          <button
            className={`btn ${editor?.isActive('table') ? 'active' : ''}`}
            title="표 삽입(3x3)"
            aria-label="Insert table"
            onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            disabled={!editor || isHtmlView}
          >
            <Icon.Table />
          </button>
          <button className="btn" title="열 추가" aria-label="Add column" onClick={() => editor?.chain().focus().addColumnAfter().run()} disabled={!editor || isHtmlView}>
            <Icon.PlusCol />
          </button>
          <button className="btn" title="행 추가" aria-label="Add row" onClick={() => editor?.chain().focus().addRowAfter().run()} disabled={!editor || isHtmlView}>
            <Icon.PlusRow />
          </button>
          <button className="btn" title="표 삭제" aria-label="Delete table" onClick={() => editor?.chain().focus().deleteTable().run()} disabled={!editor || isHtmlView}>
            <Icon.DeleteTable />
          </button>
          <span className="spacer" />
          <button className="btn" title="되돌리기" aria-label="Undo" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor || isHtmlView}>
            <Icon.Undo />
          </button>
          <button className="btn" title="다시하기" aria-label="Redo" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor || isHtmlView}>
            <Icon.Redo />
          </button>
        </div>

        {isHtmlView ? (
          <div className="html-view" style={contentStyle}>
            <label htmlFor="html-source" className="sr-only">HTML source</label>
            <textarea
              id="html-source"
              value={htmlSource}
              onChange={(e) => setHtmlSource(e.target.value)}
              onKeyDown={async (e) => {
                const isMac = navigator.platform.toUpperCase().includes('MAC')
                const mod = isMac ? e.metaKey : e.ctrlKey
                if (mod && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
                  e.preventDefault()
                  if (allowHtmlEdit) await formatHtmlSource()
                }
              }}
              readOnly={!allowHtmlEdit}
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="editor" style={contentStyle}>
            <EditorContent editor={editor} />
          </div>
        )}
      </div>
    </div>
  )
}
