import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import NotificationService, { AppNotification } from '../../services/notificationService';
import { useCurrentAccount } from '@mysten/dapp-kit';
import styles from './NotificationCenter.module.css';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
  const account = useCurrentAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]); 

  useEffect(() => {
    if (!account) return;

    NotificationService.connect(account.address);
    const unsubscribe = NotificationService.subscribe(setNotifications);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      unsubscribe();
    };
  }, [account]);

  const unreadCount = NotificationService.getUnreadCount();

  const handleMarkAsRead = (id: string) => {
    NotificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    NotificationService.markAllAsRead();
  };

  const handleClearAll = () => {
    NotificationService.clearAll();
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      asset_created: '🌾',
      asset_transferred: '📦',
      process_applied: '⚙️',
      invoice_created: '💰',
      entity_created: '👤'
    };
    return icons[type] || '🔔';
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span 
            className={styles.badge}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={unreadCount}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              className={styles.panel}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className={styles.header}>
                <h3 className={styles.title}>
                  <Bell size={20} />
                  Notifications
                  {unreadCount > 0 && (
                    <span className={styles.unreadBadge}>{unreadCount} new</span>
                  )}
                </h3>
                <div className={styles.headerActions}>
                  {notifications.length > 0 && (
                    <>
                      <button 
                        className={styles.headerButton}
                        onClick={handleMarkAllAsRead}
                        title="Mark all as read"
                      >
                        <CheckCheck size={18} />
                      </button>
                      <button 
                        className={styles.headerButton}
                        onClick={handleClearAll}
                        title="Clear all"
                      >
                        <X size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className={styles.list}>
                {notifications.length === 0 ? (
                  <div className={styles.empty}>
                    <Bell size={48} />
                    <p>No notifications yet</p>
                    <span>We'll notify you when something happens</span>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      className={`${styles.item} ${!notification.read ? styles.unread : ''}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className={styles.itemIcon}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className={styles.itemContent}>
                        <h4 className={styles.itemTitle}>{notification.title}</h4>
                        <p className={styles.itemMessage}>{notification.message}</p>
                        <span className={styles.itemTime}>
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      {!notification.read && (
                        <button 
                          className={styles.markRead}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;