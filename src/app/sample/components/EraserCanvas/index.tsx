import { useEffect, useRef } from 'react'
import { Stage, Layer, Image as KonvaImage, Line } from 'react-konva'
import { Box } from '@mui/material'
import { useEraser } from './hooks/useEraser'
import Controls from '../Controls'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

export default function EraserCanvas() {
  const {
    isEraserMode,
    restoreLines,
    deleteLines,
    restoreEraseLines,
    stageRef,
    toggleEraserMode,
    resetCanvas,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    saveImage
  } = useEraser()

  const backgroundImageRef = useRef<HTMLImageElement | null>(null)
  const foregroundImageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const loadImages = async () => {
      const bgImg = new window.Image()
      bgImg.crossOrigin = 'anonymous'
      bgImg.onload = () => {
        backgroundImageRef.current = bgImg
      }
      bgImg.src = '/sample.webp'

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
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          ref={stageRef}
        >
          {/* 復元レイヤー: 復元線の部分のみオリジナル画像を表示 */}
          <Layer>
            {restoreLines.map((line, i) => (
              <Line
                key={`restore-${i}`}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="source-over"
              />
            ))}
            {backgroundImageRef.current && restoreLines.length > 0 && (
              <KonvaImage
                image={backgroundImageRef.current}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                globalCompositeOperation="source-in"
              />
            )}
          </Layer>
          
          {/* メインレイヤー: 背景削除済み画像 + 削除マスク + 復元消去線 */}
          <Layer>
            {foregroundImageRef.current && (
              <KonvaImage
                image={foregroundImageRef.current}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
              />
            )}
            {deleteLines.map((line, i) => (
              <Line
                key={`delete-${i}`}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="source-over"
              />
            ))}
            {restoreEraseLines.map((line, i) => (
              <Line
                key={`restore-erase-${i}`}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="destination-out"
              />
            ))}
          </Layer>
        </Stage>
      </Box>
    </Box>
  )
}