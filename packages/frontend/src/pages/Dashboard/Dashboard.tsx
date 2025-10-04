import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useNavigate } from 'react-router-dom'
import { 
  Package, 
  Users, 
  TrendingUp, 
  Activity, 
  ArrowRight,
  Plus,
  RefreshCw,
  Send,
  Settings
} from 'lucide-react'
import axios from 'axios'
import styles from './Dashboard.module.css'
import { useToast } from '../../components/Toast/ToastProvider'
import Loading from '../../components/Loading/Loading'
import AnimatedNumber from '../../components/AnimatedNumber/AnimatedNumber'

interface RecentAsset {
  id: string
  name: string
  state: string
  timestamp: number
}

const Dashboard = () => {
  const account = useCurrentAccount()
  const navigate = useNavigate()
  const toast = useToast()
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalEntities: 0,
    recentActivity: 0,
    growthRate: 0
  })
  const [recentAssets, setRecentAssets] = useState<RecentAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (account) {
      loadDashboardData()
    } else {
      setLoading(false)
    }
  }, [account])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [assetsRes, entitiesRes] = await Promise.all([
        axios.get(`/api/assets/owner/${account?.address}`),
        axios.get(`/api/entities/owner/${account?.address}`)
      ])

      const assets = assetsRes.data.data || []
      const entities = entitiesRes.data.data || []

      setStats({
        totalAssets: assets.length,
        totalEntities: entities.length,
        recentActivity: assets.length + entities.length,
        growthRate: assets.length > 0 ? 15 : 0
      })

      const recent = assets.slice(0, 5).map((asset: any) => ({
        id: asset.data?.objectId || '',
        name: asset.data?.content?.fields?.name || 'Unknown',
        state: asset.data?.content?.fields?.current_state || 'CREATED',
        timestamp: Number(asset.data?.content?.fields?.creation_timestamp_ms || Date.now())
      }))

      setRecentAssets(recent)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setTimeout(() => setRefreshing(false), 500)
    toast.success('Dashboard refreshed')
  }

  if (!account) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <motion.div 
            className={styles.heroSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.heroIcon}>
              <Package size={64} />
            </div>
            <h1 className={styles.heroTitle}>Welcome to SuiNexus</h1>
            <p className={styles.heroSubtitle}>
              Blockchain-powered supply chain tracking and traceability platform
            </p>
            <p className={styles.connectPrompt}>
              Connect your wallet to get started
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <Loading text="Loading dashboard..." />
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
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>
              Overview of your supply chain operations
            </p>
          </div>
          <button 
            className={styles.refreshButton} 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? styles.spinning : ''} />
            Refresh
          </button>
        </motion.div>

        <div className={styles.statsGrid}>
          <StatCard
            icon={Package}
            label="Total Assets"
            value={stats.totalAssets}
            color="#6366f1"
            delay={0.1}
          />
          <StatCard
            icon={Users}
            label="Total Entities"
            value={stats.totalEntities}
            color="#8b5cf6"
            delay={0.2}
          />
          <StatCard
            icon={Activity}
            label="Recent Activity"
            value={stats.recentActivity}
            color="#ec4899"
            delay={0.3}
          />
          <StatCard
            icon={TrendingUp}
            label="Growth Rate"
            value={stats.growthRate}
            suffix="%"
            color="#10b981"
            delay={0.4}
          />
        </div>

        <div className={styles.contentGrid}>
          <motion.div
            className={styles.section}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className={styles.sectionHeader}>
              <h2>Quick Actions</h2>
            </div>
            <div className={styles.actionsGrid}>
              <ActionCard
                title="Create Entity"
                description="Register a new entity in the supply chain"
                link="/create-entity"
                icon={Users}
                color="#6366f1"
              />
              <ActionCard
                title="Create Harvest"
                description="Record a new harvest batch"
                link="/create-harvest"
                icon={Package}
                color="#8b5cf6"
              />
              <ActionCard
                title="Transfer Asset"
                description="Transfer asset to another entity"
                link="/transfer"
                icon={Send}
                color="#f59e0b"
              />
              <ActionCard
                title="Apply Process"
                description="Apply processing to assets"
                link="/process"
                icon={Settings}
                color="#ec4899"
              />
            </div>
          </motion.div>

          <motion.div
            className={styles.section}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className={styles.sectionHeader}>
              <h2>Recent Assets</h2>
              <button onClick={() => navigate('/tracking')} className={styles.viewAllButton}>
                View All
                <ArrowRight size={16} />
              </button>
            </div>
            {recentAssets.length === 0 ? (
              <div className={styles.emptyState}>
                <Package size={48} />
                <p>No assets yet</p>
                <button onClick={() => navigate('/create-harvest')} className={styles.createButton}>
                  <Plus size={18} />
                  Create First Asset
                </button>
              </div>
            ) : (
              <div className={styles.assetsList}>
                {recentAssets.map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    className={styles.assetItem}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => navigate(`/asset/${asset.id}`)}
                  >
                    <div className={styles.assetIcon}>
                      <Package size={20} />
                    </div>
                    <div className={styles.assetInfo}>
                      <h4>{asset.name}</h4>
                      <span className={`${styles.stateBadge} ${styles[asset.state.toLowerCase()]}`}>
                        {asset.state}
                      </span>
                    </div>
                    <ArrowRight size={18} className={styles.assetArrow} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: any
  label: string
  value: number
  suffix?: string
  color: string
  delay: number
}

const StatCard = ({ icon: Icon, label, value, suffix = '', color, delay }: StatCardProps) => {
  return (
    <motion.div
      className={styles.statCard}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
    >
      <div className={styles.statIcon} style={{ background: `${color}20` }}>
        <Icon size={28} color={color} />
      </div>
      <div className={styles.statContent}>
        <p className={styles.statLabel}>{label}</p>
        <h3 className={styles.statValue}>
          <AnimatedNumber value={value} suffix={suffix} />
        </h3>
      </div>
    </motion.div>
  )
}

interface ActionCardProps {
  title: string
  description: string
  link: string
  icon: any
  color: string
}

const ActionCard = ({ title, description, link, icon: Icon, color }: ActionCardProps) => {
  const navigate = useNavigate()

  return (
    <motion.div
      className={styles.actionCard}
      onClick={() => navigate(link)}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={styles.actionIcon} style={{ background: `${color}20` }}>
        <Icon size={24} color={color} />
      </div>
      <div className={styles.actionContent}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <ArrowRight size={18} className={styles.actionArrow} />
    </motion.div>
  )
}

export default Dashboard