import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';
import styles from './PWAInstallBanner.module.css';

const PWAInstallBanner = () => {
  const { isInstallable, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  const handleInstall = async () => {
    const installed = await installApp();
    if (installed) {
      setIsDismissed(true);
    }
  };

  if (!isInstallable || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.banner}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
      >
        <div className={styles.content}>
          <div className={styles.icon}>
            <Smartphone size={24} />
          </div>
          <div className={styles.text}>
            <h4>Install SuiNexus</h4>
            <p>Add to home screen for quick access</p>
          </div>
        </div>
        <div className={styles.actions}>
          <button className={styles.installButton} onClick={handleInstall}>
            <Download size={18} />
            Install
          </button>
          <button className={styles.closeButton} onClick={() => setIsDismissed(true)}>
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallBanner;