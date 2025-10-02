import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Package, Users, TrendingUp, Activity, BarChart3 } from 'lucide-react'
import styles from './Dashboard.module.css'
import QRCodeGenerator from '../../components/QRCode/QRCodeGenerator'
import ExportCSV from '../../components/ExportCSV/ExportCSV'
import AnalyticsChart from '../../components/Analytics/AnalyticsChart'
import SearchFilter from '../../components/SearchFilter/SearchFilter'

const Dashboard = () => {
  const account = useCurrentAccount()
  const [showQR, setShowQR] = useState(false)

  const stats = [
    { label: 'Total Entities', value: '12', change: '+3', icon: Users, color: '#6366f1' },
    { label: 'Active Assets', value: '48', change: '+12', icon: Package, color: '#8b5cf6' },
    { label: 'Processes', value: '156', change: '+28', icon: Activity, color: '#ec4899' },
    { label: 'Growth', value: '32%', change: '+8%', icon: TrendingUp, color: '#10b981' },
  ]

  const sampleData = [
    { name: 'Farm Indonesia', location: 'Jakarta', assets: 10, status: 'Active' },
    { name: 'Mill Bandung', location: 'Bandung', assets: 15, status: 'Active' },
    { name: 'Distributor A', location: 'Surabaya', assets: 8, status: 'Pending' },
  ]

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [10, 25, 18, 35, 28, 42]
  }

  const processChartData = {
    labels: ['Harvest', 'Process', 'Package', 'Ship'],
    values: [45, 38, 32, 28],
    colors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981']
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  }

  if (!account) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.container}>
          <motion.div
            className={styles.welcomeCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.glowOrb} />
            <h1 className={styles.welcomeTitle}>
              Welcome to <span className={styles.gradient}>SuiNexus</span>
            </h1>
            <p className={styles.welcomeSubtitle}>
              Next-generation supply chain tracking on Sui blockchain
            </p>
            <p className={styles.connectPrompt}>
              Connect your wallet to get started
            </p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <Package className={styles.featureIcon} />
                <span>Track Assets</span>
              </div>
              <div className={styles.feature}>
                <Users className={styles.featureIcon} />
                <span>Manage Entities</span>
              </div>
              <div className={styles.feature}>
                <Activity className={styles.featureIcon} />
                <span>Monitor Processes</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>
              Track and manage your supply chain operations
            </p>
          </div>
          <div className={styles.headerActions}>
            <ExportCSV data={sampleData} filename="entities-report" />
            <button className={styles.qrButton} onClick={() => setShowQR(!showQR)}>
              <Package size={18} />
              {showQR ? 'Hide QR' : 'Generate QR'}
            </button>
          </div>
        </motion.div>

        {showQR && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={styles.qrSection}
          >
            <QRCodeGenerator 
              data={`https://suinexus.app/asset/${account.address.slice(0, 10)}`}
              filename="suinexus-asset"
            />
          </motion.div>
        )}

        <motion.div
          className={styles.statsGrid}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                className={styles.statCard}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className={styles.statIcon} style={{ background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)` }}>
                  <Icon size={24} color={stat.color} />
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>{stat.label}</p>
                  <div className={styles.statValueRow}>
                    <h2 className={styles.statValue}>{stat.value}</h2>
                    <span className={styles.statChange}>{stat.change}</span>
                  </div>
                </div>
                <div className={styles.statGlow} style={{ background: `radial-gradient(circle, ${stat.color}40, transparent)` }} />
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          className={styles.analyticsSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.sectionHeader}>
            <BarChart3 size={24} />
            <h2 className={styles.sectionTitle}>Analytics</h2>
          </div>
          <div className={styles.chartsGrid}>
            <AnalyticsChart 
              data={chartData} 
              type="line" 
              title="Assets Created Over Time" 
            />
            <AnalyticsChart 
              data={processChartData} 
              type="bar" 
              title="Process Distribution" 
            />
          </div>
        </motion.div>

        <motion.div
          className={styles.entitiesSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.sectionHeader}>
            <Users size={24} />
            <h2 className={styles.sectionTitle}>Recent Entities</h2>
          </div>
          
          <SearchFilter
            onSearch={(query) => console.log('Search:', query)}
            onFilter={(filters) => console.log('Filters:', filters)}
            filterOptions={{
              status: [
                { label: 'Active', value: 'active' },
                { label: 'Pending', value: 'pending' },
                { label: 'Inactive', value: 'inactive' }
              ],
              location: [
                { label: 'Jakarta', value: 'jakarta' },
                { label: 'Bandung', value: 'bandung' },
                { label: 'Surabaya', value: 'surabaya' }
              ]
            }}
            placeholder="Search entities..."
          />

          <div className={styles.entitiesList}>
            {sampleData.map((entity, index) => (
              <motion.div
                key={index}
                className={styles.entityCard}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ x: 5 }}
              >
                <div className={styles.entityIcon}>
                  <Users size={20} />
                </div>
                <div className={styles.entityInfo}>
                  <h3>{entity.name}</h3>
                  <p>{entity.location}</p>
                </div>
                <div className={styles.entityStats}>
                  <span className={styles.entityAssets}>{entity.assets} assets</span>
                  <span className={`${styles.entityStatus} ${styles[entity.status.toLowerCase()]}`}>
                    {entity.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className={styles.quickActions}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <ActionCard
              title="Create Entity"
              description="Register a new entity in the supply chain"
              icon={Users}
              color="#6366f1"
              link="/create-entity"
            />
            <ActionCard
              title="Create Harvest"
              description="Record a new harvest batch"
              icon={Package}
              color="#8b5cf6"
              link="/create-harvest"
            />
            <ActionCard
              title="Track Assets"
              description="View and monitor your assets"
              icon={Activity}
              color="#ec4899"
              link="/tracking"
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

const ActionCard = ({ title, description, icon: Icon, color, link }: any) => {
  return (
    <motion.a
      href={link}
      className={styles.actionCard}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={styles.actionIcon} style={{ color }}>
        <Icon size={28} />
      </div>
      <h3 className={styles.actionTitle}>{title}</h3>
      <p className={styles.actionDescription}>{description}</p>
      <div className={styles.actionArrow}>→</div>
    </motion.a>
  )
}

export default Dashboard