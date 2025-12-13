import { useState, useRef, useCallback } from 'react'
import Konva from 'konva'

interface EraserState {
  isDrawing: boolean
  isEraserMode: boolean
  restoreLines: LineData[] // 復元用の線
  deleteLines: LineData[]  // 削除用の線
  restoreEraseLines: LineData[] // 復元時に削除線を消すための線
  clipMaskEraseLines: LineData[] // 削除時にクリッピングマスクを消すための線
}

interface LineData {
  points: number[]
  globalCompositeOperation: 'source-over' | 'destination-out'
  stroke: string
  strokeWidth: number
  type: 'restore' | 'delete' | 'restoreErase' | 'clipMaskErase'
}

export const useEraser = () => {
  // 消しゴム機能の状態管理
  const [state, setState] = useState<EraserState>({
    isDrawing: false,
    isEraserMode: false, // falseが削除モード、trueが復元モード
    restoreLines: [],     // 復元時に描画する線（オリジナル画像をマスク表示用）
    deleteLines: [],      // 削除時に描画する白い線（背景削除済み画像を隠す用）
    restoreEraseLines: [], // 復元時に削除線を消すための透明化線
    clipMaskEraseLines: [] // 削除時にクリッピングマスクを消すための線
  })
  
  const stageRef = useRef<Konva.Stage>(null)
  const isDrawing = useRef(false)
  const lastLine = useRef<any>(null)

  // 削除モード ⇔ 復元モードの切り替え
  const toggleEraserMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEraserMode: !prev.isEraserMode
    }))
  }, [])

  // 全ての描画をリセット
  const resetCanvas = useCallback(() => {
    setState(prev => ({
      ...prev,
      restoreLines: [],
      deleteLines: [],
      restoreEraseLines: [],
      clipMaskEraseLines: []
    }))
  }, [])

  // マウス押下時：新しい線の開始
  const handleMouseDown = useCallback((e: any) => {
    isDrawing.current = true
    const pos = e.target.getStage().getPointerPosition()
    
    // メインの描画線を作成
    const newLine: LineData = {
      points: [pos.x, pos.y],
      globalCompositeOperation: 'source-over',
      stroke: state.isEraserMode ? '#000000' : '#ffffff', // 復元は黒、削除は白
      strokeWidth: 20,
      type: state.isEraserMode ? 'restore' : 'delete'
    }
    
    // 復元モードの場合、削除線を消すためのラインも同時作成
    // destination-outで既存の削除線（白いライン）を透明化
    const restoreEraseLine: LineData | null = state.isEraserMode ? {
      points: [pos.x, pos.y],
      globalCompositeOperation: 'destination-out',
      stroke: '#000000',
      strokeWidth: 20,
      type: 'restoreErase'
    } : null

    // 削除モードの場合、クリッピングマスクを消すためのラインも同時作成
    // destination-outで既存のクリッピングマスク（復元線）を透明化
    const clipMaskEraseLine: LineData | null = !state.isEraserMode ? {
      points: [pos.x, pos.y],
      globalCompositeOperation: 'destination-out',
      stroke: '#000000',
      strokeWidth: 20,
      type: 'clipMaskErase'
    } : null
    
    lastLine.current = newLine
    setState(prev => ({
      ...prev,
      // モードに応じて適切な配列に線を追加
      restoreLines: state.isEraserMode ? [...prev.restoreLines, newLine] : prev.restoreLines,
      deleteLines: !state.isEraserMode ? [...prev.deleteLines, newLine] : prev.deleteLines,
      restoreEraseLines: restoreEraseLine ? [...prev.restoreEraseLines, restoreEraseLine] : prev.restoreEraseLines,
      clipMaskEraseLines: clipMaskEraseLine ? [...prev.clipMaskEraseLines, clipMaskEraseLine] : prev.clipMaskEraseLines
    }))
  }, [state.isEraserMode])

  // マウス移動時：線の継続描画
  const handleMouseMove = useCallback((e: any) => {
    if (!isDrawing.current) return
    
    const stage = e.target.getStage()
    const point = stage.getPointerPosition()
    
    setState(prev => {
      const newRestoreLines = [...prev.restoreLines]
      const newDeleteLines = [...prev.deleteLines]
      const newRestoreEraseLines = [...prev.restoreEraseLines]
      const newClipMaskEraseLines = [...prev.clipMaskEraseLines]
      
      if (state.isEraserMode && newRestoreLines.length > 0) {
        // 復元モード：復元線にポイント追加
        const currentLine = newRestoreLines[newRestoreLines.length - 1]
        currentLine.points = [...currentLine.points, point.x, point.y]
        
        // 復元消去線も同じポイントを追加（削除線と同じ軌跡で消去）
        if (newRestoreEraseLines.length > 0) {
          const currentEraseLine = newRestoreEraseLines[newRestoreEraseLines.length - 1]
          currentEraseLine.points = [...currentEraseLine.points, point.x, point.y]
        }
      } else if (!state.isEraserMode && newDeleteLines.length > 0) {
        // 削除モード：削除線にポイント追加
        const currentLine = newDeleteLines[newDeleteLines.length - 1]
        currentLine.points = [...currentLine.points, point.x, point.y]

        // クリッピングマスク除去線も同じポイントを追加（復元線と同じ軌跡で消去）
        if (newClipMaskEraseLines.length > 0) {
          const currentClipMaskEraseLine = newClipMaskEraseLines[newClipMaskEraseLines.length - 1]
          currentClipMaskEraseLine.points = [...currentClipMaskEraseLine.points, point.x, point.y]
        }
      }
      
      return {
        ...prev,
        restoreLines: newRestoreLines,
        deleteLines: newDeleteLines,
        restoreEraseLines: newRestoreEraseLines,
        clipMaskEraseLines: newClipMaskEraseLines
      }
    })
  }, [state.isEraserMode])

  // マウス離上時：描画終了
  const handleMouseUp = useCallback(() => {
    isDrawing.current = false
  }, [])

  // 現在のキャンバス状態を画像として保存
  const saveImage = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return null
    
    return stage.toDataURL({ pixelRatio: 2 }) // 高解像度で出力
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