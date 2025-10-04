import QRCode from 'qrcode';

export interface QRCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  width?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

class QRCodeGenerator {
  async generateDataURL(
    text: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    const defaultOptions = {
      errorCorrectionLevel: 'M' as const,
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      ...options
    };

    return await QRCode.toDataURL(text, defaultOptions);
  }

  async generateCanvas(
    text: string,
    canvas: HTMLCanvasElement,
    options: QRCodeOptions = {}
  ): Promise<void> {
    const defaultOptions = {
      errorCorrectionLevel: 'M' as const,
      margin: 2,
      width: 300,
      ...options
    };

    await QRCode.toCanvas(canvas, text, defaultOptions);
  }

  async generateSVG(text: string, options: QRCodeOptions = {}): Promise<string> {
    const defaultOptions = {
      errorCorrectionLevel: 'M' as const,
      margin: 2,
      width: 300,
      ...options
    };

    return await QRCode.toString(text, { type: 'svg', ...defaultOptions });
  }

  downloadQR(dataUrl: string, filename: string = 'qrcode.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  printQR(dataUrl: string) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              @media print {
                body { margin: 20px; }
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="QR Code" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }
}

export default new QRCodeGenerator();