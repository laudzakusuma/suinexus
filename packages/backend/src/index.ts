import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'SuiNexus API is running',
    network: process.env.SUI_NETWORK,
    packageId: process.env.PACKAGE_ID
  });
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