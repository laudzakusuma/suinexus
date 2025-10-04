# 🌾 SuiNexus - Blockchain Supply Chain Tracking

![SuiNexus Banner](https://via.placeholder.com/1200x300/6366f1/ffffff?text=SuiNexus+Supply+Chain+Platform)

> Blockchain-powered supply chain tracking and traceability platform built on Sui Network

## 🚀 Features

### Core Features
- ✅ **Asset Creation** - Create harvest batches as NFTs
- 🏢 **Entity Management** - Register farmers, processors, distributors
- 📦 **Asset Tracking** - Real-time tracking with QR codes
- 🔄 **Process Application** - Record processing steps with photos/videos
- 💰 **Transfer & Invoicing** - Transfer assets with automatic invoice generation
- 📊 **Advanced Analytics** - Comprehensive supply chain insights
- 🗺️ **Location Tracking** - GPS-based location mapping
- 📸 **Media Upload** - Camera capture & file uploads
- 📱 **PWA Support** - Offline-first Progressive Web App

### Technical Features
- 🔐 Wallet integration with Sui dApp Kit
- 📡 Real-time notifications
- 💾 Offline data caching (IndexedDB)
- 📄 PDF report generation
- 🔍 QR code scanning & generation
- 🎨 Beautiful glassmorphic UI
- ⚡ Lightning-fast performance
- 📱 Fully responsive design

## 📋 Prerequisites

- **Node.js** v18+ 
- **npm** or **yarn** or **pnpm**
- **Sui Wallet** (Browser extension)
- **Sui CLI** (for smart contract deployment)

## 🛠️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/suinexus.git
cd suinexus
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd packages/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

#### Backend (.env)
```bash
cd packages/backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
NODE_ENV=development

# Sui Configuration
SUI_NETWORK=devnet
PACKAGE_ID=0xYOUR_PACKAGE_ID_HERE
MODULE_NAME=nexus

# Optional
ADMIN_PRIVATE_KEY=

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env)
```bash
cd packages/frontend
```

Create `.env`:
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_PACKAGE_ID=0xYOUR_PACKAGE_ID_HERE
VITE_MODULE_NAME=nexus
VITE_SUI_NETWORK=devnet
```

### 4. Deploy Smart Contract (if not deployed)

```bash
# Navigate to contract directory
cd packages/contract

# Build the contract
sui move build

# Deploy to devnet
sui client publish --gas-budget 100000000

# Copy the Package ID from output and update .env files
```

## 🚀 Running the Application

### Development Mode

Open 3 terminal windows:

**Terminal 1 - Backend:**
```bash
cd packages/backend
npm run dev
```
Backend runs on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd packages/frontend
npm run dev
```
Frontend runs on http://localhost:3000

**Terminal 3 - Watch (Optional):**
```bash
# For auto-restart on changes
npm run dev --workspace=backend --workspace=frontend
```

### Production Build

**Backend:**
```bash
cd packages/backend
npm run build
npm start
```

**Frontend:**
```bash
cd packages/frontend
npm run build
npm run preview
```

## 📱 Using the Application

### 1. Setup Wallet
- Install [Sui Wallet](https://chrome.google.com/webstore/detail/sui-wallet) extension
- Create or import wallet
- Switch to Devnet
- Get test tokens from [Sui Devnet Faucet](https://discord.gg/sui)

### 2. Connect Wallet
- Open http://localhost:3000
- Click "Connect Wallet"
- Approve connection

### 3. Create Entity
- Navigate to "Create Entity"
- Select type (Farmer, Processor, Distributor, Retailer)
- Fill in details
- Sign transaction

### 4. Create Harvest Batch
- Go to "Create Harvest"
- Enter product details
- Set quantity and unit
- Create asset (NFT will be minted)

### 5. Apply Process
- Select "Apply Process"
- Choose asset and processor entity
- Upload photos/videos
- Add sensor data (temperature, humidity)
- Record GPS location
- Apply process

### 6. Transfer Asset
- Go to "Transfer"
- Enter asset ID and recipient
- Set invoice amount and due date
- Transfer (creates invoice NFT)

### 7. Track Assets
- Visit "Tracking"
- Search by ID or scan QR code
- View full timeline
- See location map
- Download QR code

### 8. View Analytics
- Open "Analytics"
- View comprehensive metrics
- Export PDF report
- Analyze bottlenecks
- Track performance

## 🏗️ Project Structure

```
suinexus/
├── packages/
│   ├── backend/           # Express.js API
│   │   ├── src/
│   │   │   ├── config/    # Configuration
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── .env.example
│   │   └── package.json
│   │
│   ├── frontend/          # React + TypeScript
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   ├── styles/
│   │   │   └── types/
│   │   └── package.json
│   │
│   └── contract/          # Sui Move Smart Contract
│       └── sources/
│           └── nexus.move
│
└── README.md
```

## 🧪 Testing

```bash
# Backend tests
cd packages/backend
npm test

# Frontend tests
cd packages/frontend
npm test

# E2E tests
npm run test:e2e
```

## 📦 Build for Production

```bash
# Build all packages
npm run build

# Build specific package
npm run build --workspace=frontend
npm run build --workspace=backend
```

## 🚢 Deployment

### Backend (Railway/Render/DigitalOcean)

1. Set environment variables
2. Deploy from GitHub
3. Update CORS_ORIGIN

### Frontend (Vercel/Netlify)

```bash
cd packages/frontend
npm run build

# Deploy dist/ folder
```

Set environment variables in platform dashboard.

### Smart Contract (Sui Mainnet)

```bash
sui client publish --gas-budget 100000000 --network mainnet
```

## 🛡️ Security Considerations

- ✅ Never commit `.env` files
- ✅ Use environment variables for secrets
- ✅ Enable rate limiting in production
- ✅ Validate all user inputs
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated
- ✅ Implement proper error handling

## 📚 API Documentation

### Endpoints

#### Assets
- `GET /api/assets/owner/:address` - Get assets by owner
- `GET /api/assets/:id` - Get asset details

#### Entities
- `GET /api/entities/owner/:address` - Get entities by owner
- `GET /api/entities/:id` - Get entity details

#### Health
- `GET /api/health` - Health check

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Sui Foundation
- Mysten Labs
- Open source community

## 📧 Support

- 📧 Email: support@suinexus.com
- 💬 Discord: [Join our server](#)
- 🐦 Twitter: [@SuiNexus](#)
- 📚 Docs: [docs.suinexus.com](#)

## 🗺️ Roadmap

- [ ] Mobile apps (iOS & Android)
- [ ] Multi-language support
- [ ] Advanced AI analytics
- [ ] IoT sensor integration
- [ ] Marketplace integration
- [ ] DAO governance
- [ ] Token economics

---

**Built with ❤️ on Sui Network**