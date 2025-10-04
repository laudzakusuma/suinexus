import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RotateCcw, Check } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { FileUploadService, type UploadedFile } from '../../services/fileUpload';
import { useToast } from '../Toast/ToastProvider';
import styles from './CameraCapture.module.css';

interface CameraCaptureProps {
  onCapture: (file: UploadedFile) => void;
  onClose: () => void;
}

const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('Failed to access camera. Please grant camera permission.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setCapturedImage(null);
  };

  const confirmPhoto = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    try {
      // Convert data URL to Blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Compress image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };

      const compressedBlob = await imageCompression(blob as File, options);

      // Convert to File
      const file = new File(
        [compressedBlob],
        `camera-${Date.now()}.jpg`,
        { type: 'image/jpeg' }
      );

      // Upload
      const uploadedFile = await FileUploadService.uploadFile(file);
      onCapture(uploadedFile);
      toast.success('Photo captured successfully');
      onClose();
    } catch (error) {
      console.error('Photo processing error:', error);
      toast.error('Failed to process photo');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2>Take Photo</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className={styles.cameraContainer}>
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className={styles.video}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </>
            ) : (
              <img src={capturedImage} alt="Captured" className={styles.preview} />
            )}
          </div>

          <div className={styles.controls}>
            {!capturedImage ? (
              <>
                <button className={styles.switchButton} onClick={switchCamera}>
                  <RotateCcw size={20} />
                  Switch
                </button>
                <button className={styles.captureButton} onClick={capturePhoto}>
                  <Camera size={32} />
                </button>
                <div style={{ width: '80px' }} />
              </>
            ) : (
              <>
                <button className={styles.retakeButton} onClick={retakePhoto}>
                  <RotateCcw size={20} />
                  Retake
                </button>
                <button
                  className={styles.confirmButton}
                  onClick={confirmPhoto}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className={styles.spinner} />
                  ) : (
                    <>
                      <Check size={20} />
                      Confirm
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CameraCapture;