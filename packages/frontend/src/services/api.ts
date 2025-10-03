import axios from 'axios';
import db from './db';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiService {
  private isOnline = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingTransactions();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async getAssetsByOwner(address: string) {
    try {
      if (this.isOnline) {
        const response = await axios.get(`${API_BASE_URL}/assets/owner/${address}`);
        
        // Cache in IndexedDB
        const assets = response.data.data || [];
        for (const asset of assets) {
          await db.saveAsset(asset.data?.objectId, asset);
        }
        
        return response.data;
      } else {
        // Return cached data when offline
        const cached = await db.getAllAssets();
        return {
          success: true,
          data: cached.map(c => c.data),
          cached: true
        };
      }
    } catch (error) {
      // Fallback to cache on error
      const cached = await db.getAllAssets();
      if (cached.length > 0) {
        return {
          success: true,
          data: cached.map(c => c.data),
          cached: true
        };
      }
      throw error;
    }
  }

  async getAsset(assetId: string) {
    try {
      if (this.isOnline) {
        const response = await axios.get(`${API_BASE_URL}/assets/${assetId}`);
        await db.saveAsset(assetId, response.data.data);
        return response.data;
      } else {
        const cached = await db.getAsset(assetId);
        if (cached) {
          return {
            success: true,
            data: cached.data,
            cached: true
          };
        }
        throw new Error('Asset not found in cache');
      }
    } catch (error) {
      const cached = await db.getAsset(assetId);
      if (cached) {
        return {
          success: true,
          data: cached.data,
          cached: true
        };
      }
      throw error;
    }
  }

  async getEntitiesByOwner(address: string) {
    try {
      if (this.isOnline) {
        const response = await axios.get(`${API_BASE_URL}/entities/owner/${address}`);
        
        const entities = response.data.data || [];
        for (const entity of entities) {
          await db.saveEntity(entity.data?.objectId, entity);
        }
        
        return response.data;
      } else {
        const cached = await db.getAllEntities();
        return {
          success: true,
          data: cached.map(c => c.data),
          cached: true
        };
      }
    } catch (error) {
      const cached = await db.getAllEntities();
      if (cached.length > 0) {
        return {
          success: true,
          data: cached.map(c => c.data),
          cached: true
        };
      }
      throw error;
    }
  }

  async syncPendingTransactions() {
    const pending = await db.getPendingTransactions();
    
    for (const tx of pending) {
      try {
        // Retry transaction
        // Implementation depends on transaction type
        await db.updateTransactionStatus(tx.id, 'synced');
      } catch (error) {
        await db.updateTransactionStatus(tx.id, 'failed');
      }
    }

    await db.clearSyncedTransactions();
  }
}

export default new ApiService();