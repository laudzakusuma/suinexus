import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image, Video, File, Check } from 'lucide-react';
import { FileUploadService, UploadedFile } from '../../services/fileUpload';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
  label?: string;
}

const FileUpload = ({ 
  onFilesUploaded, 
  maxFiles = 5,
  acceptedTypes = 'image/*,video/*',
  label = 'Upload Photos/Videos'
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setUploading(true);
    
    try {
      const uploaded = await FileUploadService.uploadMultiple(acceptedFiles);
      const newFiles = [...uploadedFiles, ...uploaded].slice(0, maxFiles);
      setUploadedFiles(newFiles);
      onFilesUploaded(newFiles);
    } catch (error: any) {
      alert(error.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  }, [uploadedFiles, maxFiles, onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.split(',').reduce((acc, type) => {
      acc[type.trim()] = [];
      return acc;
    }, {} as any),
    maxFiles: maxFiles - uploadedFiles.length,
    disabled: uploading || uploadedFiles.length >= maxFiles
  });

  const removeFile = (id: string) => {
    const filtered = uploadedFiles.filter(f => f.id !== id);
    setUploadedFiles(filtered);
    onFilesUploaded(filtered);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image size={20} />;
      case 'video': return <Video size={20} />;
      default: return <File size={20} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.active : ''} ${uploading ? styles.uploading : ''}`}
      >
        <input {...getInputProps()} />
        <Upload size={32} />
        <p className={styles.dropzoneText}>
          {isDragActive ? (
            'Drop files here...'
          ) : uploading ? (
            'Uploading...'
          ) : (
            <>
              Drag & drop files here, or click to select
              <span className={styles.dropzoneHint}>
                {uploadedFiles.length}/{maxFiles} files (Max 10MB each)
              </span>
            </>
          )}
        </p>
      </div>

      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            className={styles.fileList}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {uploadedFiles.map((file) => (
              <motion.div
                key={file.id}
                className={styles.fileItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className={styles.fileIcon}>
                  {getFileIcon(file.type)}
                </div>
                <div className={styles.fileInfo}>
                  <p className={styles.fileName}>{file.name}</p>
                  <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                </div>
                <div className={styles.fileActions}>
                  <span className={styles.fileSuccess}>
                    <Check size={16} />
                  </span>
                  <button
                    className={styles.removeButton}
                    onClick={() => removeFile(file.id)}
                    type="button"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;