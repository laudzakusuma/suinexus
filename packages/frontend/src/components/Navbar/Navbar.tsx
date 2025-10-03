import { Link, useLocation } from 'react-router-dom'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'
import { motion } from 'framer-motion'
import { Home, Package, Plus, Send, Workflow, Search, BarChart3 } from 'lucide-react'
import NotificationCenter from '../NotificationCenter/NotificationCenter'
import styles from './Navbar.module.css'

const Navbar = () => {
  const location = useLocation()
  const account = useCurrentAccount()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/create-entity', label: 'Create Entity', icon: Plus },
    { path: '/create-harvest', label: 'Harvest', icon: Package },
    { path: '/transfer', label: 'Transfer', icon: Send },
    { path: '/process', label: 'Process', icon: Workflow },
    { path: '/tracking', label: 'Tracking', icon: Search },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <motion.div
            className={styles.logoIcon}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Package size={28} />
          </motion.div>
          <span className={styles.logoText}>
            Sui<span className={styles.logoAccent}>Nexus</span>
          </span>
        </Link>

        <div className={styles.navLinks}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    className={styles.activeIndicator}
                    layoutId="activeIndicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        <div className={styles.walletSection}>
          <NotificationCenter />
          {account && (
            <div className={styles.accountInfo}>
              <div className={styles.statusDot} />
              <span className={styles.address}>
                {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </span>
            </div>
          )}
          <div className={styles.connectButton}>
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar