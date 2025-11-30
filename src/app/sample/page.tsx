'use client'

import { Box, Container, Typography, Paper } from '@mui/material'
import EraserCanvas from './components/EraserCanvas'

export default function SamplePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        消しゴム機能サンプル
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <EraserCanvas />
      </Paper>
    </Container>
  )
}