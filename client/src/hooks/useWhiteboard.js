import { useEffect, useRef, useState, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { useSocket } from './useSocket'

export const useWhiteboard = (roomId) => {
  const socket         = useSocket()
  const [shapes, setShapes] = useState([])
  const shapesRef      = useRef([])   // keep ref in sync for callbacks

  const updateShapes = useCallback((updater) => {
    setShapes(prev => {
      const next = updater(prev)
      shapesRef.current = next
      return next
    })
  }, [])

  useEffect(() => {
    if (!roomId) return

    socket.emit('whiteboard:join', { roomId })

    // full board on join
    socket.on('whiteboard:init', ({ shapes }) => {
      updateShapes(() => shapes)
    })

    // incremental op from another user
    socket.on('whiteboard:op', ({ op }) => {
      updateShapes(prev => applyOp(prev, op))
    })

    return () => {
      socket.off('whiteboard:init')
      socket.off('whiteboard:op')
    }
  }, [roomId])

  // emit + apply locally
  const dispatch = useCallback((op) => {
    updateShapes(prev => applyOp(prev, op))
    socket.emit('whiteboard:op', { roomId, op })
  }, [roomId, socket, updateShapes])

  // helpers
  const addShape = (type, extra = {}) => dispatch({
    type: 'add',
    shape: { id: uuid(), kind: type, x: 80, y: 80, ...defaultProps(type), ...extra }
  })

  const moveShape  = (id, x, y)      => dispatch({ type: 'move',   id, props: { x, y } })
  const updateShape = (id, props)    => dispatch({ type: 'update',  id, props })
  const deleteShape = (id)           => dispatch({ type: 'delete',  id })
  const clearBoard  = ()             => dispatch({ type: 'clear' })

  return { shapes, addShape, moveShape, updateShape, deleteShape, clearBoard }
}

// ── helpers ──────────────────────────────────────────────────────────
const applyOp = (shapes, op) => {
  switch (op.type) {
    case 'add':    return [...shapes, op.shape]
    case 'move':
    case 'update': return shapes.map(s => s.id === op.id ? { ...s, ...op.props } : s)
    case 'delete': return shapes.filter(s => s.id !== op.id)
    case 'clear':  return []
    default:       return shapes
  }
}

const defaultProps = (type) => ({
  rect:    { width: 120, height: 80,  fill: '#93C5FD', stroke: '#3B82F6', strokeWidth: 1 },
  ellipse: { radiusX: 60, radiusY: 40, fill: '#86EFAC', stroke: '#22C55E', strokeWidth: 1 },
  text:    { text: 'Double-click to edit', fontSize: 14, fill: '#1F2937', width: 160 },
  sticky:  { width: 140, height: 120, fill: '#FDE68A', stroke: '#F59E0B', strokeWidth: 1, text: 'Note...' },
  line:    { points: [0, 0, 120, 0], stroke: '#6B7280', strokeWidth: 2 },
}[type] ?? {})