import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Printer, Copy, Check } from 'lucide-react';
import qrGenerator from '../../services/qrGenerator';
import { useToast } from '../Toast/ToastProvider';
import styles from './QRCodeDisplay.module.css';

interface QRCodeDisplayProps {
  data: string;
  title?: string;
  subtitle?: string;
  size?: number;
}

const QRCodeDisplay = ({ 
  data, 
  title = 'QR Code',
  subtitle,
  size = 300 
}: QRCodeDisplayProps) => {
  const toast = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateQR();
  }, [data, size]);

  const generateQR = async () => {
    try {
      const dataUrl = await qrGenerator.generateDataURL(data, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('QR generation failed:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const handleDownload = () => {
    if (qrDataUrl) {
      qrGenerator.downloadQR(qrDataUrl, `${title.toLowerCase().replace(/\s+/g, '-')}-qr.png`);
      toast.success('QR code downloaded');
    }
  };

  const handlePrint = () => {
    if (qrDataUrl) {
      qrGenerator.printQR(qrDataUrl);
      toast.info('Opening print dialog...');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  if (!qrDataUrl) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Generating QR code...</p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      <div className={styles.qrWrapper}>
        <img src={qrDataUrl} alt="QR Code" className={styles.qrImage} />
      </div>

      <div className={styles.dataDisplay}>
        <code className={styles.dataText}>{data}</code>
        <button 
          className={styles.copyButton}
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>

      <div className={styles.actions}>
        <button className={styles.actionButton} onClick={handleDownload}>
          <Download size={18} />
          Download
        </button>
        <button className={styles.actionButton} onClick={handlePrint}>
          <Printer size={18} />
          Print
        </button>
      </div>
    </motion.div>
  );
};

export default QRCodeDisplay;