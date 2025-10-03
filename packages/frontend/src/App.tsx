import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar/Navbar'
import VideoBackground from './components/VideoBackground/VideoBackground'
import Dashboard from './pages/Dashboard/Dashboard'
import CreateEntity from './pages/CreateEntity/CreateEntity'
import CreateHarvest from './pages/CreateHarvest/CreateHarvest'
import TransferAsset from './pages/TransferAsset/TransferAsset'
import ApplyProcess from './pages/ApplyProcess/ApplyProcess'
import AssetDetail from './pages/AssetDetail/AssetDetail'
import AssetTracking from './pages/AssetTracking/AssetTracking'
import Analytics from './pages/Analytics/Analytics'
import styles from './App.module.css'

function App() {
  const location = useLocation()

  return (
    <div className={styles.app}>
      <VideoBackground />
      <Navbar />
      
      <main className={styles.main}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-entity" element={<CreateEntity />} />
            <Route path="/create-harvest" element={<CreateHarvest />} />
            <Route path="/transfer" element={<TransferAsset />} />
            <Route path="/process" element={<ApplyProcess />} />
            <Route path="/asset/:id" element={<AssetDetail />} />
            <Route path="/tracking" element={<AssetTracking />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App