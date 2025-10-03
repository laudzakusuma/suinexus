import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useCurrentAccount } from '@mysten/dapp-kit'
import axios from 'axios'
import { Package, Clock, Search, QrCode, ArrowRight } from 'lucide-react'
import QRScanner from '../../components/QRScanner/QRScanner'
import styles from './AssetTracking.module.css'
import { SkeletonCard } from '../../components/Loading/Loading'
import { useToast } from '../../components/Toast/ToastProvider'

const AssetTracking = () => {
  const account = useCurrentAccount()
  const navigate = useNavigate()
  const toast = useToast()
  
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [filteredAssets, setFilteredAssets] = useState<any[]>([])

  useEffect(() => {
    if (account) {
      fetchAssets()
    }
  }, [account])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = assets.filter(asset => {
        const fields = asset.data?.content?.fields || {}
        const objectId = asset.data?.objectId || ''
        const name = fields.name || ''
        const state = fields.current_state || ''
        
        const query = searchQuery.toLowerCase()
        return (
          objectId.toLowerCase().includes(query) ||
          name.toLowerCase().includes(query) ||
          state.toLowerCase().includes(query)
        )
      })
      setFilteredAssets(filtered)
    } else {
      setFilteredAssets(assets)
    }
  }, [searchQuery, assets])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/assets/owner/${account?.address}`)
      setAssets(response.data.data || [])
      setFilteredAssets(response.data.data || [])
      toast.success(`${response.data.data?.length || 0} assets loaded`)
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Failed to fetch assets')
      setAssets([])
      setFilteredAssets([])
    } finally {
      setLoading(false)
    }
  }

  const handleScan = (assetId: string) => {
    setShowScanner(false)
    toast.success(`Scanned: ${assetId.slice(0, 8)}...`)
    
    // Check if asset exists in user's assets
    const found = assets.find(a => a.data?.objectId === assetId)
    
    if (found) {
      navigate(`/asset/${assetId}`)
    } else {
      // If not found in user's assets, search globally
      setSearchQuery(assetId)
      toast.warning('Asset not in your wallet, searching globally...')
      searchAssetGlobally(assetId)
    }
  }

  const searchAssetGlobally = async (assetId: string) => {
    try {
      const response = await axios.get(`/api/assets/${assetId}`)
      if (response.data.success) {
        toast.info('Asset found! Navigating...')
        navigate(`/asset/${assetId}`)
      }
    } catch (error) {
      toast.error('Asset not found on blockchain')
    }
  }

  const handleAssetClick = (assetId: string) => {
    navigate(`/asset/${assetId}`)
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.warning('Please enter an asset ID or name')
      return
    }

    const found = filteredAssets[0]
    if (found) {
      handleAssetClick(found.data?.objectId)
    } else {
      toast.warning('No matching assets found')
    }
  }

  if (!account) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <motion.div 
            className={styles.emptyCard} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            <Package size={64} />
            <h2>Connect Your Wallet</h2>
            <p>Please connect your wallet to view and track your assets</p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <motion.div 
          className={styles.header} 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className={styles.title}>Asset Tracking</h1>
            <p className={styles.subtitle}>Track and monitor your supply chain assets</p>
          </div>
          <button 
            className={styles.refreshButton}
            onClick={fetchAssets}
            disabled={loading}
          >
            Refresh
          </button>
        </motion.div>

        {/* Search Bar with QR Scanner */}
        <motion.div 
          className={styles.searchContainer} 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.1 }}
        >
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={20} />
            <input 
              type="text" 
              placeholder="Search by asset ID, name, or state..." 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              className={styles.qrButton}
              onClick={() => setShowScanner(true)}
              title="Scan QR Code"
            >
              <QrCode size={20} />
            </button>
          </div>
        </motion.div>

        {/* Assets List */}
        {loading ? (
          <div className={styles.assetsList}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredAssets.length === 0 ? (
          <motion.div 
            className={styles.emptyState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Package size={64} />
            <h3>No Assets Found</h3>
            <p>
              {searchQuery 
                ? 'No assets match your search. Try different keywords.'
                : 'You don\'t have any assets yet. Create your first harvest batch!'}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            className={styles.assetsList} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.2 }}
          >
            <div className={styles.listHeader}>
              <h3 className={styles.listTitle}>
                {searchQuery ? 'Search Results' : 'Your Assets'}
              </h3>
              <span className={styles.listCount}>
                {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'}
              </span>
            </div>

            {filteredAssets.map((asset: any, index: number) => {
              const fields = asset.data?.content?.fields || {}
              const objectId = asset.data?.objectId || ''
              
              return (
                <motion.div
                  key={objectId || index}
                  className={styles.assetCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  whileHover={{ y: -5, boxShadow: '0 12px 32px rgba(99, 102, 241, 0.2)' }}
                  onClick={() => handleAssetClick(objectId)}
                >
                  <div className={styles.assetIcon}>
                    <Package size={28} />
                  </div>
                  
                  <div className={styles.assetContent}>
                    <div className={styles.assetHeader}>
                      <h3 className={styles.assetName}>{fields.name || 'Unnamed Asset'}</h3>
                      <span className={`${styles.statusBadge} ${styles[fields.current_state?.toLowerCase() || 'unknown']}`}>
                        {fields.current_state || 'UNKNOWN'}
                      </span>
                    </div>
                    
                    <p className={styles.assetDescription}>
                      {fields.description || 'No description available'}
                    </p>
                    
                    <div className={styles.assetMeta}>
                      <span className={styles.metaItem}>
                        <Package size={14} />
                        {fields.quantity || 0} {fields.unit || 'units'}
                      </span>
                      <span className={styles.metaItem}>
                        <Clock size={14} />
                        {new Date(Number(fields.creation_timestamp_ms || 0)).toLocaleDateString()}
                      </span>
                      <span className={styles.metaItem}>
                        ID: {objectId.slice(0, 8)}...
                      </span>
                    </div>
                  </div>

                  <div className={styles.assetArrow}>
                    <ArrowRight size={20} />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          title="Scan Asset QR Code"
        />
      )}
    </div>
  )
}

export default AssetTracking