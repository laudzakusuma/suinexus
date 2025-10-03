export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploadedAt: number;
  blurhash?: string;
}

export class FileUploadService {
  // In production, upload to IPFS, Arweave, or cloud storage
  // For MVP, we'll convert to base64 and store in localStorage
  
  static async uploadFile(file: File): Promise<UploadedFile> {
    return new Promise((resolve, reject) => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        reject(new Error('File size must be less than 10MB'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = () => {
        const base64 = reader.result as string;
        
        const uploadedFile: UploadedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          url: base64,
          type: this.getFileType(file.type),
          size: file.size,
          uploadedAt: Date.now()
        };

        // Store in localStorage (in production, use proper storage)
        this.saveToStorage(uploadedFile);
        
        resolve(uploadedFile);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  static async uploadMultiple(files: File[]): Promise<UploadedFile[]> {
    const uploads = files.map(file => this.uploadFile(file));
    return Promise.all(uploads);
  }

  private static getFileType(mimeType: string): 'image' | 'video' | 'document' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
  }

  private static saveToStorage(file: UploadedFile) {
    try {
      const stored = localStorage.getItem('suinexus_files');
      const files: UploadedFile[] = stored ? JSON.parse(stored) : [];
      files.push(file);
      
      // Keep only last 50 files to prevent localStorage overflow
      const limited = files.slice(-50);
      localStorage.setItem('suinexus_files', JSON.stringify(limited));
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  }

  static getFile(id: string): UploadedFile | null {
    try {
      const stored = localStorage.getItem('suinexus_files');
      const files: UploadedFile[] = stored ? JSON.parse(stored) : [];
      return files.find(f => f.id === id) || null;
    } catch (error) {
      return null;
    }
  }

  static getAllFiles(): UploadedFile[] {
    try {
      const stored = localStorage.getItem('suinexus_files');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  static deleteFile(id: string) {
    try {
      const stored = localStorage.getItem('suinexus_files');
      const files: UploadedFile[] = stored ? JSON.parse(stored) : [];
      const filtered = files.filter(f => f.id !== id);
      localStorage.setItem('suinexus_files', JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  }
}