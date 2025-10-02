import { motion } from 'framer-motion'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Package, Clock, MapPin } from 'lucide-react'
import styles from './AssetTracking.module.css'

const AssetTracking = () => {
  const account = useCurrentAccount()

  if (!account) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <motion.div className={styles.card} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2>Connect Wallet</h2>
            <p>Please connect your wallet first</p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <motion.div className={styles.header} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className={styles.title}>Asset Tracking</h1>
          <p className={styles.subtitle}>Track your assets through the supply chain</p>
        </motion.div>

        <motion.div className={styles.searchBox} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <input type="text" placeholder="Enter Asset ID to track..." className={styles.searchInput} />
          <button className={styles.searchButton}>Track Asset</button>
        </motion.div>

        <motion.div className={styles.assetsList} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className={styles.sectionTitle}>Your Assets</h2>
          
          <div className={styles.assetCard}>
            <div className={styles.assetIcon}>
              <Package size={24} />
            </div>
            <div className={styles.assetInfo}>
              <h3 className={styles.assetName}>Organic Rice</h3>
              <p className={styles.assetDescription}>Premium rice from Farm Indonesia</p>
              <div className={styles.assetMeta}>
                <span className={styles.metaItem}>
                  <Clock size={14} />
                  2 days ago
                </span>
                <span className={styles.metaItem}>
                  <MapPin size={14} />
                  Jakarta
                </span>
              </div>
            </div>
            <div className={styles.assetStatus}>
              <span className={styles.statusBadge}>HARVESTED</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AssetTracking