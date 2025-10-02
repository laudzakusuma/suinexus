import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import axios from 'axios'
import { Send } from 'lucide-react'
import styles from './TransferAsset.module.css'
import { useToast } from '../../components/Toast/ToastProvider'
import { Spinner } from '../../components/Loading/Loading'

const TransferAsset = () => {
  const account = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  const toast = useToast()
  
  const [formData, setFormData] = useState({
    asset_id: '',
    issuer_entity_id: '',
    recipient_address: '',
    invoice_amount: '',
    invoice_due_date_ms: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!account) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!formData.asset_id || !formData.issuer_entity_id || !formData.recipient_address || !formData.invoice_amount) {
      toast.warning('Please fill in all required fields')
      return
    }

    if (Number(formData.invoice_amount) < 0) {
      toast.error('Invoice amount must be positive')
      return
    }

    setLoading(true)

    try {
      toast.info('Building transaction...')
      
      const dueDateMs = formData.invoice_due_date_ms 
        ? new Date(formData.invoice_due_date_ms).getTime()
        : Date.now() + 30 * 24 * 60 * 60 * 1000 // Default 30 days
      
      const response = await axios.post('/api/assets/transfer/build-transaction', {
        asset_id: formData.asset_id,
        issuer_entity_id: formData.issuer_entity_id,
        recipient_address: formData.recipient_address,
        invoice_amount: Number(formData.invoice_amount),
        invoice_due_date_ms: dueDateMs,
        signer: account.address
      })

      const txBytes = response.data.data.txBytes
      const bytes = new Uint8Array(Buffer.from(txBytes, 'base64'))
      
      toast.info('Please sign the transaction in your wallet...')
      
      signAndExecute({
        transaction: Transaction.from(bytes)
      }, {
        onSuccess: (result) => {
          toast.success(`Asset transferred! TX: ${result.digest.slice(0, 8)}...`)
          setFormData({
            asset_id: '',
            issuer_entity_id: '',
            recipient_address: '',
            invoice_amount: '',
            invoice_due_date_ms: ''
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
      toast.error(error.response?.data?.error || 'Failed to transfer asset')
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
              <Send size={48} />
            </div>
            <h2>Connect Your Wallet</h2>
            <p>Please connect your wallet to transfer assets</p>
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
          <h1 className={styles.title}>Transfer Asset</h1>
          <p className={styles.subtitle}>Transfer asset ownership and create invoice</p>
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
            <span className={styles.hint}>The ID of the asset to transfer</span>
          </div>

          <div className={styles.formGroup}>
            <label>Issuer Entity ID</label>
            <input 
              type="text" 
              value={formData.issuer_entity_id}
              onChange={(e) => setFormData({ ...formData, issuer_entity_id: e.target.value })}
              placeholder="0x..."
              required
              className={styles.input}
              disabled={loading}
            />
            <span className={styles.hint}>The entity issuing the transfer</span>
          </div>

          <div className={styles.formGroup}>
            <label>Recipient Address</label>
            <input 
              type="text" 
              value={formData.recipient_address}
              onChange={(e) => setFormData({ ...formData, recipient_address: e.target.value })}
              placeholder="0x..."
              required
              className={styles.input}
              disabled={loading}
            />
            <span className={styles.hint}>The recipient's wallet address</span>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>Invoice Amount (MIST)</label>
              <input 
                type="number" 
                value={formData.invoice_amount}
                onChange={(e) => setFormData({ ...formData, invoice_amount: e.target.value })}
                placeholder="5000000"
                min="0"
                required
                className={styles.input}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Due Date (Optional)</label>
              <input 
                type="date" 
                value={formData.invoice_due_date_ms}
                onChange={(e) => setFormData({ ...formData, invoice_due_date_ms: e.target.value })}
                className={styles.input}
                disabled={loading}
              />
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
                <span>Transferring Asset...</span>
              </>
            ) : (
              'Transfer Asset'
            )}
          </button>
        </motion.form>
      </div>
    </div>
  )
}

export default TransferAsset