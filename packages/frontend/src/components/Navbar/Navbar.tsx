import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ConnectButton } from '@mysten/dapp-kit'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  UserPlus, 
  Package, 
  Send, 
  Settings, 
  Search, 
  BarChart3,
  Menu,
  X
} from 'lucide-react'
import NotificationCenter from '../NotificationCenter/NotificationCenter'
import styles from './Navbar.module.css'

const Navbar = () => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/create-entity', label: 'Create Entity', icon: UserPlus },
    { path: '/create-harvest', label: 'Harvest', icon: Package },
    { path: '/transfer', label: 'Transfer', icon: Send },
    { path: '/process', label: 'Process', icon: Settings },
    { path: '/tracking', label: 'Tracking', icon: Search },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Package size={28} />
          </div>
          <span className={styles.logoText}>
            Sui<span className={styles.logoAccent}>Nexus</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
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
              </Link>
            )
          })}
        </div>

        {/* Desktop Actions */}
        <div className={styles.navActions}>
          <NotificationCenter />
          <div className={styles.connectButton}>
            <ConnectButton />
          </div>
        </div>

        {/* Mobile Actions */}
        <div className={styles.mobileActions}>
          <div className={styles.mobileConnectButton}>
            <ConnectButton />
          </div>
          <button 
            className={styles.mobileMenuButton}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className={styles.mobileNavLinks}>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${styles.mobileNavLink} ${isActive ? styles.active : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar