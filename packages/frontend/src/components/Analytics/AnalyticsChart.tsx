import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import styles from './AnalyticsChart.module.css'

interface ChartData {
  labels: string[]
  values: number[]
  colors?: string[]
}

interface AnalyticsChartProps {
  data: ChartData
  type?: 'line' | 'bar'
  title: string
}

const AnalyticsChart = ({ data, type = 'line', title }: AnalyticsChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const padding = 40

    ctx.clearRect(0, 0, width, height)

    const maxValue = Math.max(...data.values)
    const chartHeight = height - padding * 2
    const chartWidth = width - padding * 2
    const barWidth = chartWidth / data.values.length

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    if (type === 'bar') {
      // Draw bars
      data.values.forEach((value, index) => {
        const x = padding + barWidth * index + barWidth * 0.1
        const barHeight = (value / maxValue) * chartHeight
        const y = height - padding - barHeight

        const gradient = ctx.createLinearGradient(0, y, 0, height - padding)
        gradient.addColorStop(0, data.colors?.[index] || '#6366f1')
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.3)')

        ctx.fillStyle = gradient
        ctx.fillRect(x, y, barWidth * 0.8, barHeight)

        // Labels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = '12px Inter'
        ctx.textAlign = 'center'
        ctx.fillText(data.labels[index], x + barWidth * 0.4, height - padding + 20)
      })
    } else {
      // Draw line chart
      ctx.strokeStyle = '#6366f1'
      ctx.lineWidth = 3
      ctx.beginPath()

      data.values.forEach((value, index) => {
        const x = padding + (chartWidth / (data.values.length - 1)) * index
        const y = height - padding - (value / maxValue) * chartHeight

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        // Draw points
        ctx.fillStyle = '#6366f1'
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()

        // Labels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.font = '12px Inter'
        ctx.textAlign = 'center'
        ctx.fillText(data.labels[index], x, height - padding + 20)
      })

      ctx.stroke()

      // Fill area under line
      const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)')
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0)')

      ctx.fillStyle = gradient
      ctx.lineTo(width - padding, height - padding)
      ctx.lineTo(padding, height - padding)
      ctx.closePath()
      ctx.fill()
    }
  }, [data, type])

  return (
    <motion.div
      className={styles.chartContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className={styles.chartTitle}>{title}</h3>
      <canvas
        ref={canvasRef}
        width={600}
        height={300}
        className={styles.canvas}
      />
    </motion.div>
  )
}

export default AnalyticsChart