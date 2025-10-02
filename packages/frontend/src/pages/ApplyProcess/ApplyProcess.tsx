import { motion } from 'framer-motion'
import { useCurrentAccount } from '@mysten/dapp-kit'
import styles from './ApplyProcess.module.css'

const ApplyProcess = () => {
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
          <h1 className={styles.title}>Apply Process</h1>
          <p className={styles.subtitle}>Apply processing step to an asset</p>
        </motion.div>

        <motion.form className={styles.form} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className={styles.formGroup}>
            <label>Asset ID</label>
            <input type="text" placeholder="0x..." className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label>Processor Entity ID</label>
            <input type="text" placeholder="0x..." className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label>Process Name</label>
            <input type="text" placeholder="e.g., Milling" className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label>New State</label>
            <input type="text" placeholder="e.g., MILLED" className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label>Notes</label>
            <textarea placeholder="Processing details..." rows={3} className={styles.textarea} />
          </div>

          <button type="submit" className={styles.button}>Apply Process</button>
        </motion.form>
      </div>
    </div>
  )
}

export default ApplyProcess