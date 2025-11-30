import { useState, useRef, useCallback } from 'react'
import Konva from 'konva'

interface EraserState {
  isDrawing: boolean
  isEraserMode: boolean
  lines: any[]
}

export const useEraser = () => {
  const [state, setState] = useState<EraserState>({
    isDrawing: false,
    isEraserMode: true,
    lines: []
  })
  
  const stageRef = useRef<Konva.Stage>(null)
  const isDrawing = useRef(false)
  const lastLine = useRef<any>(null)

  const toggleEraserMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEraserMode: !prev.isEraserMode
    }))
  }, [])

  const resetCanvas = useCallback(() => {
    setState(prev => ({
      ...prev,
      lines: []
    }))
  }, [])

  const handleMouseDown = useCallback((e: any) => {
    isDrawing.current = true
    const pos = e.target.getStage().getPointerPosition()
    
    const newLine = {
      points: [pos.x, pos.y],
      globalCompositeOperation: state.isEraserMode ? 'destination-out' : 'source-over',
      stroke: state.isEraserMode ? '#000000' : '#ffffff',
      strokeWidth: 20,
    }
    
    lastLine.current = newLine
    setState(prev => ({
      ...prev,
      lines: [...prev.lines, newLine]
    }))
  }, [state.isEraserMode])

  const handleMouseMove = useCallback((e: any) => {
    if (!isDrawing.current) return
    
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
    
    setState(prev => {
      const newLines = [...prev.lines]
      const currentLine = newLines[newLines.length - 1]
      
      if (currentLine) {
        currentLine.points = [...currentLine.points, point.x, point.y]
      }
      
      return {
        ...prev,
        lines: newLines
      }
    })
  }, [])

  const handleMouseUp = useCallback(() => {
    isDrawing.current = false
  }, [])

  const saveImage = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return null
    
    return stage.toDataURL({ pixelRatio: 2 })
  }, [])

  return {
    ...state,
    stageRef,
    toggleEraserMode,
    resetCanvas,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    saveImage
  }
}