import { useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { Download } from 'lucide-react'
import styles from './QRCodeGenerator.module.css'

interface QRCodeGeneratorProps {
  data: string
  size?: number
  filename?: string
}

const QRCodeGenerator = ({ data, size = 300, filename = 'qrcode' }: QRCodeGeneratorProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const qrCode = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        width: size,
        height: size,
        data: data,
        margin: 10,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: 'H'
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 10
        },
        dotsOptions: {
          type: 'rounded',
          color: '#6366f1',
          gradient: {
            type: 'linear',
            rotation: 45,
            colorStops: [
              { offset: 0, color: '#6366f1' },
              { offset: 1, color: '#8b5cf6' }
            ]
          }
        },
        backgroundOptions: {
          color: 'transparent'
        },
        cornersSquareOptions: {
          type: 'extra-rounded',
          color: '#6366f1'
        },
        cornersDotOptions: {
          type: 'dot',
          color: '#8b5cf6'
        }
      })
    }

    if (ref.current) {
      ref.current.innerHTML = ''
      qrCode.current.append(ref.current)
    }
  }, [data, size])

  const handleDownload = () => {
    if (qrCode.current) {
      qrCode.current.download({
        name: filename,
        extension: 'png'
      })
    }
  }

  return (
    <div className={styles.qrContainer}>
      <div className={styles.qrWrapper} ref={ref} />
      <button className={styles.downloadButton} onClick={handleDownload}>
        <Download size={18} />
        Download QR Code
      </button>
    </div>
  )
}

export default QRCodeGenerator