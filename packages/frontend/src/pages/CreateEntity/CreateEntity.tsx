import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import axios from 'axios'
import { Sparkles } from 'lucide-react'
import styles from './CreateEntity.module.css'
import { useToast } from '../../components/Toast/ToastProvider'
import { Spinner } from '../../components/Loading/Loading'

const CreateEntity = () => {
  const account = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  const toast = useToast()
  
  const [formData, setFormData] = useState({
    entity_type: 'farmer',
    name: '',
    location: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!account) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!formData.name.trim() || !formData.location.trim()) {
      toast.warning('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      toast.info('Building transaction...')
      
      const response = await axios.post('/api/entities/build-transaction', {
        ...formData,
        signer: account.address
      })

      const txBytes = response.data.data.txBytes
      const bytes = new Uint8Array(Buffer.from(txBytes, 'base64'))
      
      toast.info('Please sign the transaction in your wallet...')
      
      signAndExecute({
        transaction: Transaction.from(bytes)
      }, {
        onSuccess: (result) => {
          toast.success(`Entity created successfully! TX: ${result.digest.slice(0, 8)}...`)
          setFormData({ entity_type: 'farmer', name: '', location: '' })
          setLoading(false)
        },
        onError: (error) => {
          toast.error(`Transaction failed: ${error.message}`)
          setLoading(false)
        }
      })
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.response?.data?.error || 'Failed to create entity')
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
              <Sparkles size={48} />
            </div>
            <h2>Connect Your Wallet</h2>
            <p>Please connect your wallet to create an entity in the supply chain</p>
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
          <h1 className={styles.title}>Create Entity</h1>
          <p className={styles.subtitle}>Register a new entity in the supply chain</p>
        </motion.div>

        <motion.form 
          className={styles.form} 
          onSubmit={handleSubmit} 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.2 }}
        >
          <div className={styles.formGroup}>
            <label>Entity Type</label>
            <select 
              value={formData.entity_type} 
              onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })} 
              className={styles.select}
              disabled={loading}
            >
              <option value="farmer">🌾 Farmer</option>
              <option value="processor">⚙️ Processor</option>
              <option value="distributor">🚚 Distributor</option>
              <option value="retailer">🏪 Retailer</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Name</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              placeholder="e.g., Farm Indonesia" 
              required 
              className={styles.input}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Location</label>
            <input 
              type="text" 
              value={formData.location} 
              onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
              placeholder="e.g., Jakarta" 
              required 
              className={styles.input}
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
                <span>Creating Entity...</span>
              </>
            ) : (
              'Create Entity'
            )}
          </button>
        </motion.form>
      </div>
    </div>
  )
}

export default CreateEntity