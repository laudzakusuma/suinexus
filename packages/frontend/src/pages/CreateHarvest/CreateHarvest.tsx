import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import axios from 'axios'
import { Package } from 'lucide-react'
import styles from './CreateHarvest.module.css'
import { useToast } from '../../components/Toast/ToastProvider'
import { Spinner } from '../../components/Loading/Loading'

const CreateHarvest = () => {
  const account = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  const toast = useToast()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    unit: 'kg'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!account) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!formData.name.trim() || !formData.description.trim() || !formData.quantity) {
      toast.warning('Please fill in all fields')
      return
    }

    if (Number(formData.quantity) <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }

    setLoading(true)

    try {
      toast.info('Building transaction...')
      
      const response = await axios.post('/api/assets/harvest/build-transaction', {
        ...formData,
        quantity: Number(formData.quantity),
        signer: account.address
      })

      const txBytes = response.data.data.txBytes
      const bytes = new Uint8Array(Buffer.from(txBytes, 'base64'))
      
      toast.info('Please sign the transaction in your wallet...')
      
      signAndExecute({
        transaction: Transaction.from(bytes)
      }, {
        onSuccess: (result) => {
          toast.success(`Harvest batch created! TX: ${result.digest.slice(0, 8)}...`)
          setFormData({ name: '', description: '', quantity: '', unit: 'kg' })
          setLoading(false)
        },
        onError: (error) => {
          toast.error(`Transaction failed: ${error.message}`)
          setLoading(false)
        }
      })
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.response?.data?.error || 'Failed to create harvest batch')
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
              <Package size={48} />
            </div>
            <h2>Connect Your Wallet</h2>
            <p>Please connect your wallet to create a harvest batch</p>
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
          <h1 className={styles.title}>Create Harvest Batch</h1>
          <p className={styles.subtitle}>Record a new harvest batch in the supply chain</p>
        </motion.div>

        <motion.form 
          className={styles.form} 
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.2 }}
        >
          <div className={styles.formGroup}>
            <label>Product Name</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              placeholder="e.g., Organic Rice" 
              required
              className={styles.input}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              placeholder="Describe the product..."
              rows={4} 
              required
              className={styles.textarea}
              disabled={loading}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Quantity</label>
              <input 
                type="number" 
                value={formData.quantity} 
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} 
                placeholder="1000"
                min="1"
                required
                className={styles.input}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Unit</label>
              <select 
                value={formData.unit} 
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })} 
                className={styles.select}
                disabled={loading}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="ton">Tons</option>
                <option value="lbs">Pounds (lbs)</option>
                <option value="pcs">Pieces</option>
                <option value="box">Boxes</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={styles.button}
          >
            {loading ? (
              <>
                <Spinner size="small" />
                <span>Creating Harvest...</span>
              </>
            ) : (
              'Create Harvest Batch'
            )}
          </button>
        </motion.form>
      </div>
    </div>
  )
}

export default CreateHarvest