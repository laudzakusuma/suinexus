import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { Workflow, MapPin, Thermometer, Droplets } from 'lucide-react'
import NotificationService from '../../services/notificationService'
import FileUpload from '../../components/FileUpload/FileUpload'
import type { UploadedFile } from '../../services/fileUpload'
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
    notes: '',
    location: {
      lat: -6.2088,
      lng: 106.8456,
      address: ''
    },
    temperature: '',
    humidity: ''
  })
  const [files, setFiles] = useState<UploadedFile[]>([])
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
      
      // Build transaction directly in frontend
      const tx = new Transaction()
      
      // Prepare notes with additional metadata
      const enhancedNotes = JSON.stringify({
        notes: formData.notes || 'Process applied',
        location: formData.location.address || `${formData.location.lat}, ${formData.location.lng}`,
        temperature: formData.temperature ? `${formData.temperature}°C` : null,
        humidity: formData.humidity ? `${formData.humidity}%` : null,
        files: files.map(f => f.id),
        timestamp: new Date().toISOString()
      })
      
      tx.moveCall({
        target: `${import.meta.env.VITE_PACKAGE_ID}::${import.meta.env.VITE_MODULE_NAME || 'nexus'}::apply_process`,
        arguments: [
          tx.object(formData.asset_id),
          tx.object(formData.processor_entity_id),
          tx.pure.string(formData.process_name),
          tx.pure.string(formData.new_state),
          tx.pure.string(enhancedNotes),
          tx.object('0x6')
        ]
      })
      
      toast.info('Please sign the transaction in your wallet...')
      
      signAndExecute(
        {
          transaction: tx as any,
        },
        {
          onSuccess: (result) => {
            toast.success(`Process applied successfully! TX: ${result.digest.slice(0, 8)}...`)
            
            // Send notification
            NotificationService.notifyProcessApplied(
              formData.asset_id.slice(0, 8) + '...',
              formData.process_name
            )
            
            // Show success details
            if (files.length > 0) {
              toast.info(`${files.length} file(s) attached to process record`)
            }
            
            if (formData.temperature || formData.humidity) {
              toast.info('Sensor data recorded successfully')
            }
            
            // Reset form
            setFormData({
              asset_id: '',
              processor_entity_id: '',
              process_name: '',
              new_state: '',
              notes: '',
              location: {
                lat: -6.2088,
                lng: 106.8456,
                address: ''
              },
              temperature: '',
              humidity: ''
            })
            setFiles([])
            setLoading(false)
          },
          onError: (error) => {
            toast.error(`Transaction failed: ${error.message}`)
            setLoading(false)
          }
        }
      )
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Failed to apply process')
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
          <h1 className={styles.title}>
            <Workflow className={styles.titleIcon} />
            Apply Process
          </h1>
          <p className={styles.subtitle}>Apply a processing step to an asset with full traceability</p>
        </motion.div>

        <motion.form 
          className={styles.form} 
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.2 }}
        >
          {/* Basic Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Basic Information</h3>
            
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
          </div>

          {/* Location Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <MapPin size={20} />
              Location Information
            </h3>
            
            <div className={styles.formGroup}>
              <label>Address</label>
              <input 
                type="text" 
                value={formData.location.address}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { ...formData.location, address: e.target.value }
                })}
                placeholder="e.g., Processing Facility, Jakarta"
                className={styles.input}
                disabled={loading}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Latitude</label>
                <input 
                  type="number" 
                  step="any"
                  value={formData.location.lat}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, lat: Number(e.target.value) }
                  })}
                  placeholder="-6.2088"
                  className={styles.input}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Longitude</label>
                <input 
                  type="number" 
                  step="any"
                  value={formData.location.lng}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, lng: Number(e.target.value) }
                  })}
                  placeholder="106.8456"
                  className={styles.input}
                  disabled={loading}
                />
              </div>
            </div>
            <span className={styles.hint}>📍 GPS coordinates of processing location</span>
          </div>

          {/* Environmental Data */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Thermometer size={20} />
              Environmental Data
            </h3>
            
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>
                  <Thermometer size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Temperature (°C)
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  placeholder="e.g., 25.5"
                  className={styles.input}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <Droplets size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Humidity (%)
                </label>
                <input 
                  type="number" 
                  step="0.1"
                  value={formData.humidity}
                  onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                  placeholder="e.g., 60"
                  className={styles.input}
                  disabled={loading}
                />
              </div>
            </div>
            <span className={styles.hint}>🌡️ Optional sensor data for quality tracking</span>
          </div>

          {/* Photo/Video Upload */}
          <div className={styles.section}>
            <FileUpload
              onFilesUploaded={setFiles}
              maxFiles={5}
              acceptedTypes="image/*,video/*"
              label="📸 Upload Photos/Videos (Optional)"
            />
            {files.length > 0 && (
              <div className={styles.filesSummary}>
                ✅ {files.length} file(s) ready to attach
              </div>
            )}
          </div>

          {/* Submit Button */}
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
              <>
                <Workflow size={20} />
                Apply Process
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  )
}

export default ApplyProcess