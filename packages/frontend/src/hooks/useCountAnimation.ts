import { useEffect, useState } from 'react'

interface UseCountAnimationProps {
  end: number
  duration?: number
  start?: number
  enabled?: boolean
}

export const useCountAnimation = ({
  end,
  duration = 2000,
  start = 0,
  enabled = true
}: UseCountAnimationProps) => {
  const [count, setCount] = useState(start)

  useEffect(() => {
    if (!enabled) {
      setCount(end)
      return
    }

    let startTimestamp: number | null = null
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      
      // Easing function untuk smooth animation (easeOutQuart)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      setCount(Math.floor(easeOutQuart * (end - start) + start))

      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }

    window.requestAnimationFrame(step)
  }, [end, duration, start, enabled])

  return count
}