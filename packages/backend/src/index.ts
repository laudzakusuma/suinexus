// packages/backend/src/index.ts

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import rateLimit from 'express-rate-limit';
import { suiClient } from './config/sui'; // Import suiClient

// Fix: Load environment variables at the very top
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Fix: Apply middleware after app is initialized
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply the rate limiting middleware to API calls only
app.use('/api/', limiter);

// Fix: Use the more robust health check and remove the duplicate
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check Sui network connectivity
    const chainId = await suiClient.getChainIdentifier();
    
    res.json({ 
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'SuiNexus API',
      network: process.env.SUI_NETWORK,
      packageId: process.env.PACKAGE_ID,
      chainId,
      uptime: process.uptime()
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Service unavailable',
      error: error.message
    });
  }
});

app.use('/api', routes);

app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Network: ${process.env.SUI_NETWORK}`);
  console.log(`📝 Package ID: ${process.env.PACKAGE_ID}`);
});