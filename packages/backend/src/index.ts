import express from 'express';
import cors from 'cors';
import { SuiClient } from '@mysten/sui/client';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize Sui Client
const client = new SuiClient({
  url: process.env.SUI_RPC_URL || 'https://fullnode.devnet.sui.io'
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SuiNexus Backend',
    version: '1.0.0',
    network: process.env.SUI_RPC_URL || 'devnet'
  });
});

// Get all assets owned by an address
app.get('/api/assets/owner/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Validate address format (basic check)
    if (!address || address.length < 60) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid Sui address format' 
      });
    }

    const objects = await client.getOwnedObjects({
      owner: address,
      options: { 
        showContent: true, 
        showType: true,
        showDisplay: true,
        showOwner: true
      }
    });
    
    // Filter for DynamicAssetNFT objects
    const assets = objects.data.filter(obj => {
      const objectType = obj.data?.type;
      return objectType && objectType.includes('DynamicAssetNFT');
    });

    res.json({ 
      success: true, 
      data: assets,
      count: assets.length 
    });
  } catch (error: any) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch assets' 
    });
  }
});

// Get specific asset by ID
app.get('/api/assets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate object ID format
    if (!id || id.length < 60) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid object ID format' 
      });
    }

    const object = await client.getObject({
      id,
      options: { 
        showContent: true, 
        showType: true,
        showDisplay: true,
        showOwner: true
      }
    });

    if (!object.data) {
      return res.status(404).json({ 
        success: false, 
        error: 'Asset not found' 
      });
    }

    res.json({ 
      success: true, 
      data: object 
    });
  } catch (error: any) {
    console.error('Error fetching asset:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch asset' 
    });
  }
});

// Get all entities owned by an address
app.get('/api/entities/owner/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Validate address format
    if (!address || address.length < 60) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid Sui address format' 
      });
    }

    const objects = await client.getOwnedObjects({
      owner: address,
      options: { 
        showContent: true, 
        showType: true,
        showDisplay: true,
        showOwner: true
      }
    });
    
    // Filter for EntityObject objects
    const entities = objects.data.filter(obj => {
      const objectType = obj.data?.type;
      return objectType && objectType.includes('EntityObject');
    });

    res.json({ 
      success: true, 
      data: entities,
      count: entities.length 
    });
  } catch (error: any) {
    console.error('Error fetching entities:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch entities' 
    });
  }
});

// Get specific entity by ID
app.get('/api/entities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate object ID format
    if (!id || id.length < 60) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid object ID format' 
      });
    }

    const object = await client.getObject({
      id,
      options: { 
        showContent: true, 
        showType: true,
        showDisplay: true,
        showOwner: true
      }
    });

    if (!object.data) {
      return res.status(404).json({ 
        success: false, 
        error: 'Entity not found' 
      });
    }

    res.json({ 
      success: true, 
      data: object 
    });
  } catch (error: any) {
    console.error('Error fetching entity:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch entity' 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found' 
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 SuiNexus Backend Server Started`);
  console.log('='.repeat(50));
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Network: ${process.env.SUI_RPC_URL || 'Sui Devnet'}`);
  console.log('='.repeat(50));
});

// Handle port already in use
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use`);
    console.error('💡 Try: kill -9 $(lsof -ti:${PORT}) or use a different port\n');
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});