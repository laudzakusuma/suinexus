import { motion } from 'framer-motion'
import { useCurrentAccount } from '@mysten/dapp-kit'
import styles from './TransferAsset.module.css'

const TransferAsset = () => {
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
          <h1 className={styles.title}>Transfer Asset</h1>
          <p className={styles.subtitle}>Transfer asset and create invoice</p>
        </motion.div>

        <motion.form className={styles.form} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className={styles.formGroup}>
            <label>Asset ID</label>
            <input type="text" placeholder="0x..." className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label>Recipient Address</label>
            <input type="text" placeholder="0x..." className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label>Invoice Amount (MIST)</label>
            <input type="number" placeholder="5000000" className={styles.input} />
          </div>

          <button type="submit" className={styles.button}>Transfer Asset</button>
        </motion.form>
      </div>
    </div>
  )
}

export default TransferAsset