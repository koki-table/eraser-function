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
    lines,
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
          <Layer>
            {backgroundImageRef.current && (
              <KonvaImage
                image={backgroundImageRef.current}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
              />
            )}
          </Layer>
          
          <Layer>
            {foregroundImageRef.current && (
              <KonvaImage
                image={foregroundImageRef.current}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
              />
            )}
          </Layer>

          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={line.globalCompositeOperation}
              />
            ))}
          </Layer>
        </Stage>
      </Box>
    </Box>
  )
}