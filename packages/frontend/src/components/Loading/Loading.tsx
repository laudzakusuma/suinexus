import { motion } from 'framer-motion'
import styles from './Loading.module.css'

interface LoadingProps {
  type?: 'spinner' | 'skeleton' | 'dots'
  size?: 'small' | 'medium' | 'large'
  text?: string
}

export const Spinner = ({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) => {
  return (
    <div className={`${styles.spinner} ${styles[size]}`}>
      <div className={styles.spinnerCircle} />
    </div>
  )
}

export const Skeleton = ({ height = '20px', width = '100%' }: { height?: string, width?: string }) => {
  return (
    <div className={styles.skeleton} style={{ height, width }} />
  )
}

export const SkeletonCard = () => {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonHeader}>
        <Skeleton height="50px" width="50px" />
        <div style={{ flex: 1 }}>
          <Skeleton height="20px" width="60%" />
          <Skeleton height="16px" width="40%" />
        </div>
      </div>
      <div className={styles.skeletonBody}>
        <Skeleton height="16px" width="100%" />
        <Skeleton height="16px" width="90%" />
        <Skeleton height="16px" width="80%" />
      </div>
    </div>
  )
}

export const LoadingDots = () => {
  return (
    <div className={styles.loadingDots}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={styles.dot}
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  )
}

const Loading = ({ type = 'spinner', size = 'medium', text }: LoadingProps) => {
  return (
    <div className={styles.loadingContainer}>
      {type === 'spinner' && <Spinner size={size} />}
      {type === 'dots' && <LoadingDots />}
      {text && <p className={styles.loadingText}>{text}</p>}
    </div>
  )
}

export default Loading