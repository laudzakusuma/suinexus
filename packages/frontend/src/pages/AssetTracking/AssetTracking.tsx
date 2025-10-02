import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCurrentAccount } from '@mysten/dapp-kit'
import axios from 'axios'
import { Package, Clock, Search } from 'lucide-react'
import styles from './AssetTracking.module.css'
import { SkeletonCard } from '../../components/Loading/Loading'
import { useToast } from '../../components/Toast/ToastProvider'
import Modal from '../../components/Modal/Modal'

const AssetTracking = () => {
  const account = useCurrentAccount()
  const toast = useToast()
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (account) {
      fetchAssets()
    }
  }, [account])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/assets/owner/${account?.address}`)
      setAssets(response.data.data || [])
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Failed to fetch assets')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.warning('Please enter an asset ID')
      return
    }

    try {
      const response = await axios.get(`/api/assets/${searchQuery}`)
      if (response.data.success) {
        setSelectedAsset(response.data.data)
        setShowModal(true)
      }
    } catch (error) {
      toast.error('Asset not found')
    }
  }

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
          <input 
            type="text" 
            placeholder="Enter Asset ID to track..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className={styles.searchButton} onClick={handleSearch}>
            <Search size={18} />
            Track Asset
          </button>
        </motion.div>

        {loading ? (
          <div className={styles.assetsList}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : assets.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={48} color="rgba(255,255,255,0.3)" />
            <p>No assets found. Create your first harvest batch!</p>
          </div>
        ) : (
          <motion.div className={styles.assetsList} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h3 className={styles.listTitle}>Your Assets ({assets.length})</h3>
            {assets.map((asset: any, index: number) => {
              const fields = asset.data?.content?.fields || {}
              return (
                <motion.div
                  key={asset.data?.objectId || index}
                  className={styles.assetCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setSelectedAsset(asset)
                    setShowModal(true)
                  }}
                >
                  <div className={styles.assetIcon}>
                    <Package size={24} />
                  </div>
                  <div className={styles.assetInfo}>
                    <h3 className={styles.assetName}>{fields.name || 'Unknown Asset'}</h3>
                    <p className={styles.assetDescription}>{fields.description || 'No description'}</p>
                    <div className={styles.assetMeta}>
                      <span className={styles.metaItem}>
                        <Package size={14} />
                        {fields.quantity} {fields.unit}
                      </span>
                      <span className={styles.metaItem}>
                        <Clock size={14} />
                        {new Date(Number(fields.creation_timestamp_ms || 0)).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className={styles.assetStatus}>
                    <span className={styles.statusBadge}>{fields.current_state || 'UNKNOWN'}</span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        <Modal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
          title="Asset Details"
          size="large"
        >
          {selectedAsset && (
            <div className={styles.modalContent}>
              <div className={styles.detailSection}>
                <h4>Basic Information</h4>
                <div className={styles.detailGrid}>
                  <div>
                    <label>Name:</label>
                    <p>{selectedAsset.data?.content?.fields?.name}</p>
                  </div>
                  <div>
                    <label>Quantity:</label>
                    <p>{selectedAsset.data?.content?.fields?.quantity} {selectedAsset.data?.content?.fields?.unit}</p>
                  </div>
                  <div>
                    <label>Current State:</label>
                    <p>{selectedAsset.data?.content?.fields?.current_state}</p>
                  </div>
                  <div>
                    <label>Created:</label>
                    <p>{new Date(Number(selectedAsset.data?.content?.fields?.creation_timestamp_ms || 0)).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.detailSection}>
                <h4>History</h4>
                <div className={styles.historyList}>
                  {selectedAsset.data?.content?.fields?.history?.map((item: string, i: number) => (
                    <div key={i} className={styles.historyItem}>
                      <div className={styles.historyDot}></div>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>Object ID</h4>
                <p className={styles.objectId}>{selectedAsset.data?.objectId}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

export default AssetTracking