export type NotificationType = 'asset_created' | 'asset_transferred' | 'process_applied' | 'invoice_created' | 'entity_created';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: any;
}

class NotificationService {
  private notifications: AppNotification[] = [];
  private listeners: ((notifications: AppNotification[]) => void)[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;

  connect(address: string) {
    console.log(`Notification service connected for ${address}`);
    this.loadFromStorage();
    this.startPolling();
  }

  disconnect() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  subscribe(callback: (notifications: AppNotification[]) => void) {
    this.listeners.push(callback);
    callback(this.notifications);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  addNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: AppNotification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false
    };

    this.notifications.unshift(newNotification);
    
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    
    this.saveToStorage();
    this.notifyListeners();
    this.showBrowserNotification(newNotification);

    return newNotification;
  }

  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveToStorage();
    this.notifyListeners();
  }

  clearAll() {
    this.notifications = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getAllNotifications(): AppNotification[] {
    return this.notifications;
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  private saveToStorage() {
    try {
      localStorage.setItem('suinexus_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('suinexus_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  private startPolling() {
    this.pollingInterval = setInterval(() => {
      this.notifyListeners();
    }, 30000);
  }

  private async showBrowserNotification(notification: AppNotification) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png'
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon-192x192.png'
        });
      }
    }
  }

  notifyAssetCreated(assetName: string, assetId: string) {
    return this.addNotification({
      type: 'asset_created',
      title: 'New Asset Created',
      message: `${assetName} has been created successfully`,
      data: { assetId }
    });
  }

  notifyAssetTransferred(assetName: string, recipient: string) {
    return this.addNotification({
      type: 'asset_transferred',
      title: 'Asset Transferred',
      message: `${assetName} transferred to ${recipient.slice(0, 8)}...`,
      data: { recipient }
    });
  }

  notifyProcessApplied(assetName: string, processName: string) {
    return this.addNotification({
      type: 'process_applied',
      title: 'Process Applied',
      message: `${processName} applied to ${assetName}`,
      data: { processName }
    });
  }

  notifyInvoiceCreated(amount: number) {
    return this.addNotification({
      type: 'invoice_created',
      title: 'Invoice Created',
      message: `New invoice for ${amount} MIST created`,
      data: { amount }
    });
  }

  notifyEntityCreated(entityName: string, entityType: string) {
    return this.addNotification({
      type: 'entity_created',
      title: 'Entity Created',
      message: `${entityName} (${entityType}) registered successfully`,
      data: { entityType }
    });
  }
}

export default new NotificationService();