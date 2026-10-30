import { useRef, useState, useEffect, useCallback } from 'react'
import {
  Stage, Layer, Rect, Ellipse, Text, Line,
  Group, Circle, RegularPolygon, Arrow,
} from 'react-konva'
import { useWhiteboard } from '../../hooks/useWhiteboard'
import DrawTools from './DrawTools'

// ─── theme tokens (must match Room.jsx THEMES) ─────────────────────────────
const THEMES = {
  dark: {
    bg: '#0D0D0F',
    dot: 'rgba(255,255,255,0.06)',
    surface: '#131316',
    border: '#222228',
    borderStr: '#2E2E38',
    text: '#F0F0F4',
    textMuted: '#7C7C8A',
    textFaint: '#3A3A44',
    accent: '#7C6AF7',
    accentGlow: 'rgba(124,106,247,0.25)',
    selection: '#7C6AF7',
    selFill: 'rgba(124,106,247,0.08)',
    shadow: '0 8px 32px rgba(0,0,0,0.7)',
    glass: 'rgba(19,19,22,0.88)',
    minimap: '#1A1A1F',
  },
  light: {
    bg: '#F0F0F5',
    dot: 'rgba(0,0,0,0.08)',
    surface: '#FFFFFF',
    border: '#E5E5EA',
    borderStr: '#D1D1D8',
    text: '#18181B',
    textMuted: '#6B6B78',
    textFaint: '#C8C8D0',
    accent: '#6355E8',
    accentGlow: 'rgba(99,85,232,0.2)',
    selection: '#6355E8',
    selFill: 'rgba(99,85,232,0.06)',
    shadow: '0 8px 32px rgba(0,0,0,0.12)',
    glass: 'rgba(255,255,255,0.90)',
    minimap: '#E8E8EE',
  },
}

// ─── tiny icon svg ──────────────────────────────────────────────────────────
const Ico = ({ d, size = 15, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.9} strokeLinecap="round"
    strokeLinejoin="round" style={style}>
    <path d={d} />
  </svg>
)

const I = {
  select: 'M5 3l14 9-7 1-4 7z',
  rect: 'M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  ellipse: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  text: 'M4 7V4h16v3M9 20h6M12 4v16',
  sticky: 'M9 2H4a2 2 0 00-2 2v16l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2H9z',
  line: 'M5 19L19 5',
  arrow: 'M5 12h14M12 5l7 7-7 7',
  diamond: 'M12 2l10 10-10 10L2 12z',
  delete: 'M18 6L6 18M6 6l12 12',
  clear: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  zoomIn: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35M11 8v6M8 11h6',
  zoomOut: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35M8 11h6',
  fit: 'M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M16 21h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3',
  hand: 'M18 11V6a2 2 0 00-4 0v5M14 10V4a2 2 0 00-4 0v6M10 10.5V6a2 2 0 00-4 0v8a6 6 0 1012 0v-3a2 2 0 00-4 0',
  undo: 'M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 010 11H11',
  redo: 'M15 14l5-5-5-5M19 9H8.5a5.5 5.5 0 000 11H13',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
}

// ─── palette ────────────────────────────────────────────────────────────────
const PALETTE = [
  '#F87171', '#FB923C', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6',
  '#E5E7EB', '#6B7280', '#1F2937',
]

// ─── default shape props ────────────────────────────────────────────────────
const defaults = (kind, color) => ({
  rect: { width: 140, height: 90, fill: color, stroke: 'transparent', strokeWidth: 0, cornerRadius: 6 },
  ellipse: { radiusX: 70, radiusY: 50, fill: color, stroke: 'transparent', strokeWidth: 0 },
  text: { text: 'Double-click to edit', fontSize: 15, fill: '#F0F0F4', width: 180 },
  sticky: { width: 160, height: 130, fill: '#FBBF24', stroke: 'transparent', strokeWidth: 0, text: 'Your note…' },
  line: { points: [0, 0, 120, 0], stroke: color, strokeWidth: 2.5 },
  arrow: { points: [0, 0, 120, 0], stroke: color, strokeWidth: 2.5 },
  diamond: { sides: 4, radius: 60, fill: color, stroke: 'transparent', strokeWidth: 0 },
}[kind])

// ─── Canvas ──────────────────────────────────────────────────────────────────
const Canvas = ({ roomId, theme = 'dark' }) => {
  const T = THEMES[theme] ?? THEMES.dark
  const { shapes, addShape, moveShape, updateShape, deleteShape, clearBoard } = useWhiteboard(roomId)

  const [tool, setTool] = useState('select')
  const [color, setColor] = useState('#7C6AF7')
  const [selectedId, setSelectedId] = useState(null)

  // infinite canvas state
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })

  const stageRef = useRef()
  const panOrigin = useRef(null)
  const containerRef = useRef()

  // resize observer
  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        setSize({ w: e.contentRect.width, h: e.contentRect.height })
      }
    })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // ── keyboard shortcuts ──────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        deleteShape(selectedId); setSelectedId(null)
      }
      if (e.key === 'Escape') setSelectedId(null)
      if (e.key === 'v') setTool('select')
      if (e.key === 'r') setTool('rect')
      if (e.key === 'e') setTool('ellipse')
      if (e.key === 't') setTool('text')
      if (e.key === 'n') setTool('sticky')
      if (e.key === 'l') setTool('line')
      if (e.key === 'a') setTool('arrow')
      if (e.key === 'h') setTool('hand')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId])

  // ── wheel zoom ──────────────────────────────────────────────────────────
  const onWheel = useCallback((e) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return
    const pointer = stage.getPointerPosition()
    const scaleBy = 1.06
    const oldScale = scale
    const newScale = e.evt.deltaY < 0
      ? Math.min(oldScale * scaleBy, 8)
      : Math.max(oldScale / scaleBy, 0.08)

    const mousePointTo = {
      x: (pointer.x - offset.x) / oldScale,
      y: (pointer.y - offset.y) / oldScale,
    }
    setOffset({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    })
    setScale(newScale)
  }, [scale, offset])

  // ── pan ─────────────────────────────────────────────────────────────────
  const onStageMouseDown = (e) => {
    const isStage = e.target === e.target.getStage()
    if (tool === 'hand' || (tool === 'select' && e.evt.button === 1)) {
      setIsPanning(true)
      panOrigin.current = { x: e.evt.clientX - offset.x, y: e.evt.clientY - offset.y }
      return
    }
    if (isStage) setSelectedId(null)
  }

  const onStageMouseMove = (e) => {
    if (!isPanning || !panOrigin.current) return
    setOffset({
      x: e.evt.clientX - panOrigin.current.x,
      y: e.evt.clientY - panOrigin.current.y,
    })
  }

  const onStageMouseUp = () => { setIsPanning(false); panOrigin.current = null }

  // ── click to add shape ──────────────────────────────────────────────────
  const onStageClick = () => {
    if (tool === 'select' || tool === 'hand') return
    if (isPanning) return
    const stage = stageRef.current
    if (!stage) return
    const pointer = stage.getPointerPosition()
    // convert screen → canvas coords
    const x = (pointer.x - offset.x) / scale
    const y = (pointer.y - offset.y) / scale

    addShape(tool, { x, y, ...defaults(tool, color) })
    setTool('select')
  }

  // ── zoom controls ───────────────────────────────────────────────────────
  const zoomTo = (factor) => {
    const cx = size.w / 2, cy = size.h / 2
    const newScale = Math.min(Math.max(scale * factor, 0.08), 8)
    setOffset({
      x: cx - (cx - offset.x) * (newScale / scale),
      y: cy - (cy - offset.y) * (newScale / scale),
    })
    setScale(newScale)
  }

  const fitView = () => { setScale(1); setOffset({ x: 0, y: 0 }) }

  // ── render shape ────────────────────────────────────────────────────────
  const renderShape = (shape) => {
    const isSelected = selectedId === shape.id
    const selStroke = isSelected ? T.selection : (shape.stroke ?? 'transparent')
    const selSW = isSelected ? 2 : (shape.strokeWidth ?? 0)

    const common = {
      key: shape.id,
      id: shape.id,
      x: shape.x,
      y: shape.y,
      draggable: tool === 'select',
      onClick: (e) => { e.cancelBubble = true; setSelectedId(shape.id) },
      onDragEnd: (e) => moveShape(shape.id, e.target.x(), e.target.y()),
      onDragStart: () => setSelectedId(shape.id),
    }

    switch (shape.kind) {
      case 'rect':
        return (
          <Rect {...common}
            width={shape.width} height={shape.height}
            fill={shape.fill} cornerRadius={shape.cornerRadius ?? 6}
            stroke={selStroke} strokeWidth={selSW}
            shadowEnabled={isSelected}
            shadowColor={T.selection} shadowBlur={12} shadowOpacity={0.4}
          />
        )
      case 'ellipse':
        return (
          <Ellipse {...common}
            radiusX={shape.radiusX} radiusY={shape.radiusY}
            fill={shape.fill}
            stroke={selStroke} strokeWidth={selSW}
            shadowEnabled={isSelected}
            shadowColor={T.selection} shadowBlur={12} shadowOpacity={0.4}
          />
        )
      case 'diamond':
        return (
          <RegularPolygon {...common}
            sides={4} radius={shape.radius ?? 60}
            fill={shape.fill}
            stroke={selStroke} strokeWidth={selSW}
            shadowEnabled={isSelected}
            shadowColor={T.selection} shadowBlur={12} shadowOpacity={0.4}
          />
        )
      case 'text':
        return (
          <Text {...common}
            text={shape.text} fontSize={shape.fontSize ?? 15}
            fill={shape.fill ?? T.text} width={shape.width ?? 200}
            padding={4}
            stroke={isSelected ? T.selection : undefined}
            strokeWidth={isSelected ? 0.5 : 0}
            onDblClick={() => {
              const v = window.prompt('Edit text:', shape.text)
              if (v !== null) updateShape(shape.id, { text: v })
            }}
          />
        )
      case 'sticky': {
        const sw = shape.width ?? 160
        const sh = shape.height ?? 130
        return (
          <Group {...common}>
            <Rect
              width={sw} height={sh}
              fill={shape.fill ?? '#FBBF24'}
              cornerRadius={6}
              stroke={selStroke} strokeWidth={selSW}
              shadowEnabled={isSelected}
              shadowColor={T.selection} shadowBlur={14} shadowOpacity={0.4}
            />
            {/* folded corner */}
            <Line points={[sw - 20, 0, sw, 0, sw, 20]} closed fill='rgba(0,0,0,0.12)' stroke='rgba(0,0,0,0.08)' strokeWidth={1} />
            <Text
              text={shape.text ?? ''} fontSize={12}
              fill='#18181B' width={sw - 24} x={10} y={10}
              wrap='word' lineHeight={1.5}
              onDblClick={() => {
                const v = window.prompt('Edit note:', shape.text)
                if (v !== null) updateShape(shape.id, { text: v })
              }}
            />
          </Group>
        )
      }
      case 'line':
        return (
          <Line {...common}
            points={shape.points ?? [0, 0, 100, 0]}
            stroke={isSelected ? T.selection : (shape.stroke ?? color)}
            strokeWidth={shape.strokeWidth ?? 2.5}
            lineCap='round' lineJoin='round'
            hitStrokeWidth={12}
          />
        )
      case 'arrow':
        return (
          <Arrow {...common}
            points={shape.points ?? [0, 0, 100, 0]}
            stroke={isSelected ? T.selection : (shape.stroke ?? color)}
            strokeWidth={shape.strokeWidth ?? 2.5}
            fill={isSelected ? T.selection : (shape.stroke ?? color)}
            pointerLength={10} pointerWidth={8}
            lineCap='round' lineJoin='round'
            hitStrokeWidth={12}
          />
        )
      default: return null
    }
  }

  // ── dot grid background ─────────────────────────────────────────────────
  const gridSpacing = 28 * scale
  const dotR = Math.max(0.6, scale * 0.8)

  const gridDots = []
  const startX = ((offset.x % gridSpacing) - gridSpacing)
  const startY = ((offset.y % gridSpacing) - gridSpacing)
  const cols = Math.ceil(size.w / gridSpacing) + 2
  const rows = Math.ceil(size.h / gridSpacing) + 2

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      gridDots.push(
        <Circle
          key={`${c}-${r}`}
          x={startX + c * gridSpacing}
          y={startY + r * gridSpacing}
          radius={dotR}
          fill={T.dot}
          listening={false}
        />
      )
    }
  }

  const cursor =
    tool === 'hand' || isPanning ? 'grab'
      : tool === 'select' ? 'default'
        : 'crosshair'

  return (
    <div ref={containerRef} style={{
      position: 'absolute', inset: 0,
      background: T.bg,
      overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* ── Konva Stage ── */}
      <Stage
        ref={stageRef}
        width={size.w}
        height={size.h}
        style={{ cursor, display: 'block' }}
        onWheel={onWheel}
        onMouseDown={onStageMouseDown}
        onMouseMove={onStageMouseMove}
        onMouseUp={onStageMouseUp}
        onClick={onStageClick}
        scaleX={scale} scaleY={scale}
        x={offset.x} y={offset.y}
      >
        {/* dot grid layer — unscaled by inverting stage scale */}
        <Layer scaleX={1 / scale} scaleY={1 / scale} x={-offset.x / scale} y={-offset.y / scale} listening={false}>
          {gridDots}
        </Layer>

        {/* shapes layer */}
        <Layer>
          {shapes.map(renderShape)}

          {/* selection bounding box */}
          {selectedId && (() => {
            const s = shapes.find(sh => sh.id === selectedId)
            if (!s) return null
            const pad = 6
            let bx = s.x - pad, by = s.y - pad, bw, bh
            switch (s.kind) {
              case 'rect': bw = s.width + pad * 2; bh = s.height + pad * 2; break
              case 'ellipse': bx = s.x - s.radiusX - pad; by = s.y - s.radiusY - pad; bw = s.radiusX * 2 + pad * 2; bh = s.radiusY * 2 + pad * 2; break
              case 'diamond': bx = s.x - (s.radius ?? 60) - pad; by = s.y - (s.radius ?? 60) - pad; bw = (s.radius ?? 60) * 2 + pad * 2; bh = (s.radius ?? 60) * 2 + pad * 2; break
              case 'sticky': bw = (s.width ?? 160) + pad * 2; bh = (s.height ?? 130) + pad * 2; break
              case 'text': bw = (s.width ?? 200) + pad * 2; bh = 32; break
              default: return null
            }
            return (
              <Rect
                x={bx} y={by} width={bw} height={bh}
                fill={T.selFill} stroke={T.selection}
                strokeWidth={1} dash={[4, 3]} cornerRadius={4}
                listening={false}
              />
            )
          })()}
        </Layer>
      </Stage>

      {/* ── Floating toolbar ── */}
      <div style={{
        position: 'absolute', left: '50%', bottom: 80,
        transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 2,
        background: T.glass,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: '5px 6px',
        boxShadow: T.shadow,
        zIndex: 20,
      }}>
        {[
          ['select', 'V', I.select],
          ['hand', 'H', I.hand],
          null,
          ['rect', 'R', I.rect],
          ['ellipse', 'E', I.ellipse],
          ['diamond', 'D', I.diamond],
          ['text', 'T', I.text],
          ['sticky', 'N', I.sticky],
          ['line', 'L', I.line],
          ['arrow', 'A', I.arrow],
        ].map((item, i) => {
          if (item === null) return (
            <div key={i} style={{ width: 1, height: 24, background: T.border, margin: '0 3px' }} />
          )
          const [t, shortcut, icon] = item
          const active = tool === t
          return (
            <button key={t} onClick={() => setTool(t)} title={`${t} (${shortcut})`}
              style={{
                width: 36, height: 36, borderRadius: 9, border: 'none',
                background: active ? T.accent : 'transparent',
                color: active ? '#fff' : T.textMuted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all .12s',
                boxShadow: active ? `0 0 12px ${T.accentGlow}` : 'none',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.border }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <Ico d={icon} size={15} />
              <span style={{
                position: 'absolute', bottom: 3, right: 4,
                fontSize: 7, fontWeight: 600, opacity: .45,
                fontFamily: "'DM Mono', monospace",
                color: active ? '#fff' : T.textFaint,
              }}>{shortcut}</span>
            </button>
          )
        })}

        <div style={{ width: 1, height: 24, background: T.border, margin: '0 3px' }} />

        {/* Color palette */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '0 2px' }}>
          {PALETTE.map(c => (
            <div key={c} onClick={() => setColor(c)} style={{
              width: c === color ? 20 : 16,
              height: c === color ? 20 : 16,
              borderRadius: '50%',
              background: c,
              cursor: 'pointer',
              transition: 'all .12s',
              boxShadow: c === color ? `0 0 0 2px ${T.bg}, 0 0 0 4px ${c}` : 'none',
              flexShrink: 0,
            }} />
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: T.border, margin: '0 3px' }} />

        {/* Delete + Clear */}
        <IconBtn T={T} title="Delete selected (Del)" danger
          onClick={() => { if (selectedId) { deleteShape(selectedId); setSelectedId(null) } }}>
          <Ico d={I.delete} size={15} />
        </IconBtn>
        <IconBtn T={T} title="Clear board"
          onClick={() => { if (window.confirm('Clear the entire board?')) clearBoard() }}>
          <Ico d={I.clear} size={15} />
        </IconBtn>
      </div>

      {/* ── Zoom controls (bottom-right) ── */}
      <div style={{
        position: 'absolute', right: 20, bottom: 80,
        display: 'flex', flexDirection: 'column', gap: 4,
        zIndex: 20,
      }}>
        {[
          { title: 'Zoom in (+)', icon: I.zoomIn, action: () => zoomTo(1.25) },
          { title: 'Zoom out (-)', icon: I.zoomOut, action: () => zoomTo(0.8) },
          { title: 'Reset view', icon: I.fit, action: fitView },
        ].map(({ title, icon, action }) => (
          <button key={title} onClick={action} title={title} style={{
            width: 34, height: 34, borderRadius: 9,
            background: T.glass,
            backdropFilter: 'blur(12px)',
            border: `1px solid ${T.border}`,
            color: T.textMuted, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: T.shadow, transition: 'all .12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.background = T.surface }}
            onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = T.glass }}
          >
            <Ico d={icon} size={14} />
          </button>
        ))}

        {/* Zoom % badge */}
        <div style={{
          height: 28, borderRadius: 7,
          background: T.glass,
          backdropFilter: 'blur(12px)',
          border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600,
          color: T.textMuted,
          fontFamily: "'DM Mono', monospace",
          boxShadow: T.shadow,
          paddingInline: 8,
          minWidth: 34,
        }}>
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* ── Minimap (bottom-right corner) ── */}
      <Minimap shapes={shapes} T={T} viewW={size.w} viewH={size.h} scale={scale} offset={offset} />

      {/* ── Contextual hint ── */}
      {tool !== 'select' && tool !== 'hand' && (
        <div style={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          background: T.glass, backdropFilter: 'blur(12px)',
          border: `1px solid ${T.border}`,
          borderRadius: 8, padding: '5px 14px',
          fontSize: 11, color: T.textMuted,
          pointerEvents: 'none', zIndex: 20,
          fontFamily: "'DM Mono', monospace",
          letterSpacing: '.04em',
        }}>
          click to place {tool} · esc to cancel
        </div>
      )}

      {/* ── Selected shape info ── */}
      {selectedId && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          background: T.glass, backdropFilter: 'blur(12px)',
          border: `1px solid ${T.border}`,
          borderRadius: 10, padding: '8px 12px',
          fontSize: 11, color: T.textMuted,
          zIndex: 20,
          fontFamily: "'DM Mono', monospace",
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{ color: T.text, fontWeight: 500, fontSize: 12 }}>
            {shapes.find(s => s.id === selectedId)?.kind ?? ''}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span>x: {Math.round(shapes.find(s => s.id === selectedId)?.x ?? 0)}</span>
            <span>y: {Math.round(shapes.find(s => s.id === selectedId)?.y ?? 0)}</span>
          </div>
          <button onClick={() => { deleteShape(selectedId); setSelectedId(null) }}
            style={{
              marginTop: 2, background: 'rgba(248,113,113,0.12)',
              border: '1px solid rgba(248,113,113,0.25)', borderRadius: 5,
              color: '#F87171', fontSize: 11, cursor: 'pointer', padding: '3px 0',
              fontFamily: 'inherit'
            }}>
            Delete  ⌫
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Minimap ────────────────────────────────────────────────────────────────
const Minimap = ({ shapes, T, viewW, viewH, scale, offset }) => {
  const W = 140, H = 90
  const mmScale = 0.06

  const viewport = {
    x: -offset.x * mmScale / scale,
    y: -offset.y * mmScale / scale,
    w: viewW * mmScale / scale,
    h: viewH * mmScale / scale,
  }

  return (
    <div style={{
      position: 'absolute', right: 20, bottom: 220,
      width: W, height: H,
      background: T.minimap,
      border: `1px solid ${T.border}`,
      borderRadius: 8,
      overflow: 'hidden',
      zIndex: 20,
      opacity: .85,
    }}>
      {/* shapes */}
      <svg width={W} height={H}>
        {shapes.map(s => {
          const x = s.x * mmScale + W / 2, y = s.y * mmScale + H / 2
          switch (s.kind) {
            case 'rect':
            case 'sticky':
              return <rect key={s.id} x={x} y={y}
                width={(s.width ?? 120) * mmScale} height={(s.height ?? 90) * mmScale}
                fill={s.fill} opacity={0.7} rx={1} />
            case 'ellipse':
              return <ellipse key={s.id} cx={x} cy={y}
                rx={(s.radiusX ?? 50) * mmScale} ry={(s.radiusY ?? 35) * mmScale}
                fill={s.fill} opacity={0.7} />
            case 'line':
            case 'arrow': {
              const [x1, y1, x2, y2] = s.points ?? [0, 0, 60, 0]
              return <line key={s.id}
                x1={x + x1 * mmScale} y1={y + y1 * mmScale}
                x2={x + x2 * mmScale} y2={y + y2 * mmScale}
                stroke={s.stroke} strokeWidth={1} opacity={0.7} />
            }
            default: return null
          }
        })}
        {/* viewport rect */}
        <rect
          x={viewport.x + W / 2} y={viewport.y + H / 2}
          width={Math.min(viewport.w, W)} height={Math.min(viewport.h, H)}
          fill='none' stroke='#7C6AF7' strokeWidth={1.5} opacity={0.8}
          rx={2}
        />
      </svg>
      <div style={{
        position: 'absolute', bottom: 3, right: 5,
        fontSize: 8, color: T.textFaint,
        fontFamily: "'DM Mono', monospace",
      }}>minimap</div>
    </div>
  )
}

// ─── Icon button ─────────────────────────────────────────────────────────────
const IconBtn = ({ T, children, onClick, title, danger }) => (
  <button onClick={onClick} title={title} style={{
    width: 36, height: 36, borderRadius: 9, border: 'none',
    background: 'transparent',
    color: danger ? '#F87171' : T.textMuted,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all .12s',
  }}
    onMouseEnter={e => { e.currentTarget.style.background = danger ? 'rgba(248,113,113,0.12)' : T.border }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
  >
    {children}
  </button>
)

export default Canvas