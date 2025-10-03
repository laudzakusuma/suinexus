import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './QRScanner.module.css';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  title?: string;
}

const QRScanner = ({ onScan, onClose, title = 'Scan QR Code' }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  useEffect(() => {
    loadCameras();
    return () => {
      stopScanning();
    };
  }, []);

  const loadCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);
      if (devices.length > 0) {
        // Prefer back camera on mobile
        const backCamera = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
        setSelectedCamera(backCamera.id);
      }
    } catch (err) {
      setError('Unable to access cameras. Please grant camera permission.');
    }
  };

  const startScanning = async () => {
    if (!selectedCamera) {
      setError('No camera available');
      return;
    }

    try {
      setError(null);
      setIsScanning(true);

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          setSuccess(true);
          setTimeout(() => {
            onScan(decodedText);
            stopScanning();
            onClose();
          }, 500);
        },
        () => {
          // Scan error (ignore, happens frequently)
        }
      );
    } catch (err: any) {
      setError(err.message || 'Failed to start camera');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const handleClose = async () => {
    await stopScanning();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2>{title}</h2>
            <button className={styles.closeButton} onClick={handleClose}>
              <X size={24} />
            </button>
          </div>

          <div className={styles.content}>
            {!isScanning && cameras.length > 0 && (
              <div className={styles.controls}>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className={styles.cameraSelect}
                >
                  {cameras.map(camera => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label || `Camera ${camera.id}`}
                    </option>
                  ))}
                </select>

                <button
                  className={styles.startButton}
                  onClick={startScanning}
                >
                  <Camera size={20} />
                  Start Scanning
                </button>
              </div>
            )}

            <div className={styles.scannerContainer}>
              <div id="qr-reader" className={styles.qrReader}></div>
              
              {success && (
                <motion.div
                  className={styles.successOverlay}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <CheckCircle size={64} color="#10b981" />
                  <p>QR Code Scanned!</p>
                </motion.div>
              )}
            </div>

            {error && (
              <div className={styles.error}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {isScanning && (
              <button
                className={styles.stopButton}
                onClick={stopScanning}
              >
                Stop Scanning
              </button>
            )}
          </div>

          <div className={styles.instructions}>
            <p>Position the QR code within the frame</p>
            <p className={styles.tip}>💡 Tip: Ensure good lighting for best results</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QRScanner;