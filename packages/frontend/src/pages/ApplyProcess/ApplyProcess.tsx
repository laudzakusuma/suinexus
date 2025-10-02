import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import axios from 'axios'
import { Workflow } from 'lucide-react'
import styles from './ApplyProcess.module.css'
import { useToast } from '../../components/Toast/ToastProvider'
import { Spinner } from '../../components/Loading/Loading'

const ApplyProcess = () => {
  const account = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  const toast = useToast()
  
  const [formData, setFormData] = useState({
    asset_id: '',
    processor_entity_id: '',
    process_name: '',
    new_state: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!account) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!formData.asset_id || !formData.processor_entity_id || !formData.process_name || !formData.new_state) {
      toast.warning('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      toast.info('Building transaction...')
      
      const response = await axios.post('/api/assets/process/build-transaction', {
        asset_id: formData.asset_id,
        processor_entity_id: formData.processor_entity_id,
        process_name: formData.process_name,
        new_state: formData.new_state,
        notes: formData.notes || 'Process applied',
        signer: account.address
      })

      const txBytes = response.data.data.txBytes
      const bytes = new Uint8Array(Buffer.from(txBytes, 'base64'))
      
      toast.info('Please sign the transaction in your wallet...')
      
      signAndExecute({
        transaction: Transaction.from(bytes)
      }, {
        onSuccess: (result) => {
          toast.success(`Process applied! TX: ${result.digest.slice(0, 8)}...`)
          setFormData({
            asset_id: '',
            processor_entity_id: '',
            process_name: '',
            new_state: '',
            notes: ''
          })
          setLoading(false)
        },
        onError: (error) => {
          toast.error(`Transaction failed: ${error.message}`)
          setLoading(false)
        }
      })
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.response?.data?.error || 'Failed to apply process')
      setLoading(false)
    }
  }

  if (!account) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <motion.div 
            className={styles.card} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.cardIcon}>
              <Workflow size={48} />
            </div>
            <h2>Connect Your Wallet</h2>
            <p>Please connect your wallet to apply processes to assets</p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header} 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className={styles.title}>Apply Process</h1>
          <p className={styles.subtitle}>Apply a processing step to an asset</p>
        </motion.div>

        <motion.form 
          className={styles.form} 
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.2 }}
        >
          <div className={styles.formGroup}>
            <label>Asset ID</label>
            <input 
              type="text" 
              value={formData.asset_id}
              onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
              placeholder="0x..."
              required
              className={styles.input}
              disabled={loading}
            />
            <span className={styles.hint}>The asset to process</span>
          </div>

          <div className={styles.formGroup}>
            <label>Processor Entity ID</label>
            <input 
              type="text" 
              value={formData.processor_entity_id}
              onChange={(e) => setFormData({ ...formData, processor_entity_id: e.target.value })}
              placeholder="0x..."
              required
              className={styles.input}
              disabled={loading}
            />
            <span className={styles.hint}>The entity performing the process</span>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Process Name</label>
              <input 
                type="text" 
                value={formData.process_name}
                onChange={(e) => setFormData({ ...formData, process_name: e.target.value })}
                placeholder="e.g., Milling, Packaging"
                required
                className={styles.input}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>New State</label>
              <select 
                value={formData.new_state}
                onChange={(e) => setFormData({ ...formData, new_state: e.target.value })}
                className={styles.select}
                required
                disabled={loading}
              >
                <option value="">Select state...</option>
                <option value="HARVESTED">🌾 Harvested</option>
                <option value="CLEANED">🧼 Cleaned</option>
                <option value="MILLED">⚙️ Milled</option>
                <option value="PACKAGED">📦 Packaged</option>
                <option value="SHIPPED">🚚 Shipped</option>
                <option value="DELIVERED">✅ Delivered</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Notes (Optional)</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional processing details..."
              rows={3}
              className={styles.textarea}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={styles.button}
          >
            {loading ? (
              <>
                <Spinner size="small" />
                <span>Applying Process...</span>
              </>
            ) : (
              'Apply Process'
            )}
          </button>
        </motion.form>
      </div>
    </div>
  )
}

export default ApplyProcess