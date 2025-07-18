"use client";

import { useState, useRef, useCallback } from 'react';
import { uploadFile } from '@/lib/firebase-service';
import { Button } from './button';
import { Progress } from './progress';
import { cn } from '@/lib/utils';
import { Upload, X, File, Image as ImageIcon, Video } from 'lucide-react';

interface FileUploadProps {
  onUpload: (url: string, file: File) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

interface UploadingFile {
  file: File;
  progress: number;
  url?: string;
  error?: string;
}

export function FileUpload({
  onUpload,
  onError,
  accept = "image/*,video/*",
  maxSize = 50, // 50MB default
  className,
  children,
  disabled = false
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file) return false;

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        onError?.(`File size too large. Maximum size is ${maxSize}MB.`);
        return false;
      }

      // Check file type if accept is specified
      if (accept && accept !== "*") {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const fileType = file.type || '';
        const fileName = file.name || '';

        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return fileName.toLowerCase().endsWith(type.toLowerCase());
          } else if (type.includes('*')) {
            const [category] = type.split('/');
            return fileType.startsWith(category);
          } else {
            return fileType === type;
          }
        });

        if (!isAccepted) {
          onError?.(`File type not supported. Accepted types: ${accept}`);
          return false;
        }
      }

      return true;
    });

    if (validFiles.length === 0) return;

    // Add files to uploading state
    const newUploadingFiles = validFiles.map(file => ({
      file,
      progress: 0
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload each file
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const fileIndex = uploadingFiles.length + i;

      try {
        if (!file || !file.name) {
          throw new Error('Invalid file');
        }

        // Generate unique path
        const timestamp = Date.now();
        const fileName = file.name;
        const fileType = file.type || '';
        const folder = fileType.startsWith('image/') ? 'images' : 'videos';
        const path = `${folder}/${timestamp}_${fileName}`;

        // Simulate progress for now (Firebase doesn't provide upload progress directly)
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => prev.map((f, idx) =>
            idx === fileIndex ? { ...f, progress: Math.min(f.progress + 10, 90) } : f
          ));
        }, 200);

        // Upload file
        const url = await uploadFile(file, path);

        clearInterval(progressInterval);

        // Update state with success
        setUploadingFiles(prev => prev.map((f, idx) =>
          idx === fileIndex ? { ...f, progress: 100, url } : f
        ));

        // Call onUpload callback
        onUpload(url, file);

        // Remove from uploading state after a delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter((_, idx) => idx !== fileIndex));
        }, 2000);

      } catch (error) {
        console.error('Upload error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';

        setUploadingFiles(prev => prev.map((f, idx) =>
          idx === fileIndex ? { ...f, error: errorMessage } : f
        ));

        onError?.(errorMessage);
      }
    }
  }, [accept, maxSize, onUpload, onError, uploadingFiles.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles, disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFiles]);

  const removeUploadingFile = useCallback((index: number) => {
    setUploadingFiles(prev => prev.filter((_, idx) => idx !== index));
  }, []);

  const getFileIcon = (file: File) => {
    if (!file) return <File className="h-4 w-4" />;
    const fileType = file.type || '';
    if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver
            ? "border-primary bg-primary/10"
            : "border-gray-600 hover:border-gray-500",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          multiple
          className="hidden"
          disabled={disabled}
        />

        {children || (
          <div className="space-y-4">
            <Upload className="h-12 w-12 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium">
                Drop files here or{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  browse
                </Button>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Maximum file size: {maxSize}MB
              </p>
              {accept && accept !== "*" && (
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: {accept}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile, index) => (
            <div
              key={`${uploadingFile.file.name}-${index}`}
              className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
            >
              {getFileIcon(uploadingFile.file)}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {uploadingFile.file.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress
                    value={uploadingFile.progress}
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-gray-400 min-w-[40px]">
                    {uploadingFile.progress}%
                  </span>
                </div>
                {uploadingFile.error && (
                  <p className="text-xs text-red-400 mt-1">
                    {uploadingFile.error}
                  </p>
                )}
                {uploadingFile.url && uploadingFile.progress === 100 && (
                  <p className="text-xs text-green-400 mt-1">
                    Upload complete!
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-white"
                onClick={() => removeUploadingFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
