import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SuiNexusDB extends DBSchema {
  assets: {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
  entities: {
    key: string;
    value: {
      id: string;
      data: any;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
  transactions: {
    key: string;
    value: {
      id: string;
      type: 'create' | 'transfer' | 'process';
      data: any;
      status: 'pending' | 'synced' | 'failed';
      timestamp: number;
    };
    indexes: { 'by-status': string; 'by-timestamp': number };
  };
}

class DatabaseService {
  private db: IDBPDatabase<SuiNexusDB> | null = null;
  private dbName = 'suinexus-db';
  private dbVersion = 1;

  async init() {
    if (this.db) return this.db;

    this.db = await openDB<SuiNexusDB>(this.dbName, this.dbVersion, {
      upgrade(db) {
        // Assets store
        if (!db.objectStoreNames.contains('assets')) {
          const assetStore = db.createObjectStore('assets', { keyPath: 'id' });
          assetStore.createIndex('by-timestamp', 'timestamp');
        }

        // Entities store
        if (!db.objectStoreNames.contains('entities')) {
          const entityStore = db.createObjectStore('entities', { keyPath: 'id' });
          entityStore.createIndex('by-timestamp', 'timestamp');
        }

        // Transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txStore.createIndex('by-status', 'status');
          txStore.createIndex('by-timestamp', 'timestamp');
        }
      },
    });

    return this.db;
  }

  // Assets methods
  async saveAsset(id: string, data: any) {
    const db = await this.init();
    await db.put('assets', {
      id,
      data,
      timestamp: Date.now()
    });
  }

  async getAsset(id: string) {
    const db = await this.init();
    return await db.get('assets', id);
  }

  async getAllAssets() {
    const db = await this.init();
    return await db.getAll('assets');
  }

  async deleteAsset(id: string) {
    const db = await this.init();
    await db.delete('assets', id);
  }

  // Entities methods
  async saveEntity(id: string, data: any) {
    const db = await this.init();
    await db.put('entities', {
      id,
      data,
      timestamp: Date.now()
    });
  }

  async getEntity(id: string) {
    const db = await this.init();
    return await db.get('entities', id);
  }

  async getAllEntities() {
    const db = await this.init();
    return await db.getAll('entities');
  }

  // Offline transaction queue
  async queueTransaction(type: 'create' | 'transfer' | 'process', data: any) {
    const db = await this.init();
    const id = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await db.put('transactions', {
      id,
      type,
      data,
      status: 'pending',
      timestamp: Date.now()
    });

    return id;
  }

  async getPendingTransactions() {
    const db = await this.init();
    const index = db.transaction('transactions').store.index('by-status');
    return await index.getAll('pending');
  }

  async updateTransactionStatus(id: string, status: 'synced' | 'failed') {
    const db = await this.init();
    const tx = await db.get('transactions', id);
    if (tx) {
      tx.status = status;
      await db.put('transactions', tx);
    }
  }

  async clearSyncedTransactions() {
    const db = await this.init();
    const all = await db.getAll('transactions');
    const synced = all.filter(tx => tx.status === 'synced');
    
    for (const tx of synced) {
      await db.delete('transactions', tx.id);
    }
  }

  // Clear all data
  async clearAll() {
    const db = await this.init();
    await db.clear('assets');
    await db.clear('entities');
    await db.clear('transactions');
  }
}

export default new DatabaseService();