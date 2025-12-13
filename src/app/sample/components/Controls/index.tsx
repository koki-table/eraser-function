import { Box, Button, Chip, Stack } from '@mui/material'
import { Eraser, PaintBrush, ArrowClockwise, Download } from '@phosphor-icons/react'
import { EraserMode, EraserModeType } from '../EraserCanvas/hooks/useEraser'

interface ControlsProps {
  currentMode: EraserModeType
  onToggleEraser: () => void
  onReset: () => void
  onSave: () => string | null
}

// モード表示用の定数
const ModeLabels = {
  [EraserMode.Delete]: '削除モード',
  [EraserMode.Restore]: '復元モード'
} as const

export default function Controls({ 
  currentMode, 
  onToggleEraser, 
  onReset, 
  onSave 
}: ControlsProps) {
  const handleSave = () => {
    const dataURL = onSave()
    if (dataURL) {
      const link = document.createElement('a')
      link.download = 'eraser-result.png'
      link.href = dataURL
      link.click()
    }
  }

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center">
        <Chip 
          label={ModeLabels[currentMode]}
          color={currentMode === EraserMode.Restore ? 'primary' : 'error'}
          variant="filled"
          size="small"
        />
        
        <Button
          variant={currentMode === EraserMode.Delete ? 'contained' : 'outlined'}
          color="error"
          startIcon={<Eraser size={20} />}
          onClick={onToggleEraser}
        >
          削除
        </Button>

        <Button
          variant={currentMode === EraserMode.Restore ? 'contained' : 'outlined'}
          color="primary"
          startIcon={<PaintBrush size={20} />}
          onClick={onToggleEraser}
        >
          復元
        </Button>

        <Button
          variant="outlined"
          startIcon={<ArrowClockwise size={20} />}
          onClick={onReset}
        >
          リセット
        </Button>

        <Button
          variant="contained"
          color="success"
          startIcon={<Download size={20} />}
          onClick={handleSave}
        >
          保存
        </Button>
      </Stack>
    </Box>
  )
}