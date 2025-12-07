import { useState, useRef, useCallback } from 'react'
import Konva from 'konva'

interface EraserState {
  isDrawing: boolean
  isEraserMode: boolean
  restoreLines: LineData[] // 復元用の線
  deleteLines: LineData[]  // 削除用の線
  restoreEraseLines: LineData[] // 復元時に削除線を消すための線
}

interface LineData {
  points: number[]
  globalCompositeOperation: 'source-over' | 'destination-out'
  stroke: string
  strokeWidth: number
  type: 'restore' | 'delete' | 'restoreErase'
}

export const useEraser = () => {
  const [state, setState] = useState<EraserState>({
    isDrawing: false,
    isEraserMode: false, // falseが削除モード、trueが復元モード
    restoreLines: [],
    deleteLines: [],
    restoreEraseLines: []
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
      restoreLines: [],
      deleteLines: [],
      restoreEraseLines: []
    }))
  }, [])

  const handleMouseDown = useCallback((e: any) => {
    isDrawing.current = true
    const pos = e.target.getStage().getPointerPosition()
    
    const newLine: LineData = {
      points: [pos.x, pos.y],
      globalCompositeOperation: 'source-over',
      stroke: state.isEraserMode ? '#000000' : '#ffffff',
      strokeWidth: 20,
      type: state.isEraserMode ? 'restore' : 'delete'
    }
    
    // 復元モードの場合、削除線を消すためのラインも作成
    const restoreEraseLine: LineData | null = state.isEraserMode ? {
      points: [pos.x, pos.y],
      globalCompositeOperation: 'destination-out',
      stroke: '#000000',
      strokeWidth: 20,
      type: 'restoreErase'
    } : null
    
    lastLine.current = newLine
    setState(prev => ({
      ...prev,
      restoreLines: state.isEraserMode ? [...prev.restoreLines, newLine] : prev.restoreLines,
      deleteLines: !state.isEraserMode ? [...prev.deleteLines, newLine] : prev.deleteLines,
      restoreEraseLines: restoreEraseLine ? [...prev.restoreEraseLines, restoreEraseLine] : prev.restoreEraseLines
    }))
  }, [state.isEraserMode])

  const handleMouseMove = useCallback((e: any) => {
    if (!isDrawing.current) return
    
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
    
    setState(prev => {
      const newRestoreLines = [...prev.restoreLines]
      const newDeleteLines = [...prev.deleteLines]
      const newRestoreEraseLines = [...prev.restoreEraseLines]
      
      if (state.isEraserMode && newRestoreLines.length > 0) {
        const currentLine = newRestoreLines[newRestoreLines.length - 1]
        currentLine.points = [...currentLine.points, point.x, point.y]
        
        // 復元消去線も同じポイントを追加
        if (newRestoreEraseLines.length > 0) {
          const currentEraseLine = newRestoreEraseLines[newRestoreEraseLines.length - 1]
          currentEraseLine.points = [...currentEraseLine.points, point.x, point.y]
        }
      } else if (!state.isEraserMode && newDeleteLines.length > 0) {
        const currentLine = newDeleteLines[newDeleteLines.length - 1]
        currentLine.points = [...currentLine.points, point.x, point.y]
      }
      
      return {
        ...prev,
        restoreLines: newRestoreLines,
        deleteLines: newDeleteLines,
        restoreEraseLines: newRestoreEraseLines
      }
    })
  }, [state.isEraserMode])

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