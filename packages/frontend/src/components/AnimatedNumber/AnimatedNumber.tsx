import { useCountAnimation } from '../../hooks/useCountAnimation'
import styles from './AnimatedNumber.module.css'

interface AnimatedNumberProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
  enableGlow?: boolean
}

const AnimatedNumber = ({ 
  value, 
  duration = 2000, 
  prefix = '', 
  suffix = '',
  decimals = 0,
  className = '',
  enableGlow = false
}: AnimatedNumberProps) => {
  const count = useCountAnimation({ end: value, duration })
  
  const formattedValue = decimals > 0 
    ? (count / Math.pow(10, decimals)).toFixed(decimals)
    : count.toLocaleString()

  return (
    <span className={`${styles.wrapper} ${className}`}>
      {prefix && <span className={styles.prefix}>{prefix}</span>}
      <span className={`${styles.animatedNumber} ${enableGlow ? styles.glow : ''}`}>
        {formattedValue}
      </span>
      {suffix && <span className={styles.suffix}>{suffix}</span>}
    </span>
  )
}

export default AnimatedNumber