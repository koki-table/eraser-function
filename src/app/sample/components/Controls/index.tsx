import { Box, Button, Chip, Stack } from '@mui/material'
import { Eraser, PaintBrush, ArrowClockwise, Download } from '@phosphor-icons/react'

interface ControlsProps {
  isEraserMode: boolean
  onToggleEraser: () => void
  onReset: () => void
  onSave: () => string | null
}

export default function Controls({ 
  isEraserMode, 
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
          label={isEraserMode ? '消しゴムモード' : '復元モード'}
          color={isEraserMode ? 'error' : 'primary'}
          variant="filled"
          size="small"
        />
        
        <Button
          variant={isEraserMode ? 'contained' : 'outlined'}
          color="error"
          startIcon={<Eraser size={20} />}
          onClick={onToggleEraser}
        >
          消しゴム
        </Button>

        <Button
          variant={!isEraserMode ? 'contained' : 'outlined'}
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