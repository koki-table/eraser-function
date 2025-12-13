import { useEffect, useRef } from 'react'
import { Stage, Layer, Image as KonvaImage, Line } from 'react-konva'
import { Box } from '@mui/material'
import { useEraser } from './hooks/useEraser'
import Controls from '../Controls'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

export default function EraserCanvas() {
  // 消しゴム機能の状態とイベントハンドラを取得
  const {
    isEraserMode,     // 現在のモード（true:復元、false:削除）
    restoreLines,     // 復元用の線データ配列
    deleteLines,      // 削除用の線データ配列
    restoreEraseLines, // 復元時の削除線消去用配列
    clipMaskEraseLines, // 削除時のクリッピングマスク消去用配列
    stageRef,
    toggleEraserMode,
    resetCanvas,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    saveImage
  } = useEraser()

  // 画像リファレンスを管理
  const backgroundImageRef = useRef<HTMLImageElement | null>(null)  // オリジナル画像（復元時に表示）
  const foregroundImageRef = useRef<HTMLImageElement | null>(null)  // 背景削除済み画像（メイン表示）

  // コンポーネントマウント時に画像を読み込み
  useEffect(() => {
    const loadImages = async () => {
      // オリジナル画像の読み込み（復元時に使用）
      const bgImg = new window.Image()
      bgImg.crossOrigin = 'anonymous'
      bgImg.onload = () => {
        backgroundImageRef.current = bgImg
      }
      bgImg.src = '/sample.webp'

      // 背景削除済み画像の読み込み（メイン表示用）
      const fgImg = new window.Image()  
      fgImg.crossOrigin = 'anonymous'
      fgImg.onload = () => {
        foregroundImageRef.current = fgImg
      }
      fgImg.src = '/sampleBgRemovedLayer.png'
    }

    loadImages()
  }, [])

  return (
    <Box>
      <Controls
        isEraserMode={isEraserMode}
        onToggleEraser={toggleEraserMode}
        onReset={resetCanvas}
        onSave={saveImage}
      />
      
      <Box 
        sx={{ 
          border: 1, 
          borderColor: 'grey.300', 
          borderRadius: 1,
          display: 'inline-block',
          mt: 2
        }}
      >
        <Stage
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handleMouseDown}  // 描画開始イベント
          onMousemove={handleMouseMove}  // 描画継続イベント
          onMouseup={handleMouseUp}      // 描画終了イベント
          ref={stageRef}
        >
          {/* 復元レイヤー: 復元線の部分のみオリジナル画像を表示 */}
          <Layer>
            {/* 復元線を描画（マスクとして使用） */}
            {restoreLines.map((line, i) => (
              <Line
                key={`restore-${i}`}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="source-over"  // 通常描画
              />
            ))}
            {/* クリッピングマスク除去線でクリッピングマスクを削除 */}
            {clipMaskEraseLines.map((line, i) => (
              <Line
                key={`clipMaskErase-${i}`}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="destination-out"  // 既存のマスクを消去
              />
            ))}
            {/* 復元線がある場合のみ、その形状でオリジナル画像をクリッピング表示 */}
            {backgroundImageRef.current && restoreLines.length > 0 && (
              <KonvaImage
                image={backgroundImageRef.current}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                globalCompositeOperation="source-in"  // 上の線の形状でマスク
              />
            )}
          </Layer>
          
          {/* メインレイヤー: 背景削除済み画像 + 削除マスク + 復元消去線 */}
          <Layer>
            {/* 背景削除済み画像をベースとして表示 */}
            {foregroundImageRef.current && (
              <KonvaImage
                image={foregroundImageRef.current}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
              />
            )}
            {/* 削除線（白い線）で背景削除済み画像の一部を隠す */}
            {deleteLines.map((line, i) => (
              <Line
                key={`delete-${i}`}
                points={line.points}
                stroke={line.stroke}        // 白色
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="source-over"  // 通常描画
              />
            ))}
            {/* 復元消去線で削除線（白い線）を透明化 */}
            {restoreEraseLines.map((line, i) => (
              <Line
                key={`restore-erase-${i}`}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="destination-out"  // 既存描画を消去
              />
            ))}
          </Layer>
        </Stage>
      </Box>
    </Box>
  )
}