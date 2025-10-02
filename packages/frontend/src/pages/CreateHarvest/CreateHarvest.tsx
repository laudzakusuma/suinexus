import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCurrentAccount } from '@mysten/dapp-kit'
import styles from './CreateHarvest.module.css'

const CreateHarvest = () => {
  const account = useCurrentAccount()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    unit: 'kg'
  })

  if (!account) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <motion.div className={styles.card} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2>Connect Wallet</h2>
            <p>Please connect your wallet to create a harvest batch</p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <motion.div className={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className={styles.title}>Create Harvest Batch</h1>
          <p className={styles.subtitle}>Record a new harvest batch in the supply chain</p>
        </motion.div>

        <motion.form className={styles.form} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className={styles.formGroup}>
            <label>Product Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Organic Rice" className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the product..." rows={4} className={styles.textarea} />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Quantity</label>
              <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="1000" className={styles.input} />
            </div>

            <div className={styles.formGroup}>
              <label>Unit</label>
              <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className={styles.select}>
                <option value="kg">Kilograms</option>
                <option value="ton">Tons</option>
                <option value="lbs">Pounds</option>
                <option value="pcs">Pieces</option>
              </select>
            </div>
          </div>

          <button type="submit" className={styles.button}>Create Harvest Batch</button>
        </motion.form>
      </div>
    </div>
  )
}

export default CreateHarvest