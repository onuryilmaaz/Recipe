import React, { useState, useRef, useCallback } from "react";
import { toast } from "react-hot-toast";
import ModernLoader from "../Loader/ModernLoader";

const DragDropUpload = ({
  onUpload,
  multiple = false,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  className = "",
  uploadText = "Dosyalarınızı sürükleyip bırakın veya seçin",
  uploadSubtext = "PNG, JPG, JPEG, WEBP formatları desteklenir",
  showPreviews = true,
  processFiles = true,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  // Validate file type and size
  const validateFile = (file) => {
    if (!acceptedFileTypes.includes(file.type)) {
      toast.error(`Desteklenmeyen dosya formatı: ${file.name}`);
      return false;
    }

    if (file.size > maxFileSize) {
      toast.error(`Dosya çok büyük: ${file.name} (Max: ${maxFileSize / (1024 * 1024)}MB)`);
      return false;
    }

    return true;
  };

  // Process selected files
  const processSelectedFiles = useCallback((selectedFiles) => {
    const fileList = Array.from(selectedFiles);
    
    // Validate file count
    if (!multiple && fileList.length > 1) {
      toast.error("Sadece tek dosya yükleyebilirsiniz");
      return;
    }

    if (multiple && fileList.length > maxFiles) {
      toast.error(`En fazla ${maxFiles} dosya yükleyebilirsiniz`);
      return;
    }

    // Validate each file
    const validFiles = fileList.filter(validateFile);

    if (validFiles.length === 0) {
      return;
    }

    // Create file objects with preview URLs
    const newFiles = validFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      status: 'pending', // pending, uploading, completed, error
      progress: 0,
      url: null,
      thumbnailUrl: null,
    }));

    if (multiple) {
      setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
    } else {
      setFiles(newFiles);
    }
  }, [multiple, maxFiles, maxFileSize, acceptedFileTypes]);

  // Handle drag events
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set drag over to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processSelectedFiles(droppedFiles);
    }
  }, [processSelectedFiles]);

  // Handle file input change
  const handleFileSelect = useCallback((e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      processSelectedFiles(selectedFiles);
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  }, [processSelectedFiles]);

  // Remove file from list
  const removeFile = (fileId) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== fileId);
      // Revoke object URL to prevent memory leaks
      const removedFile = prev.find(f => f.id === fileId);
      if (removedFile && removedFile.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return updatedFiles;
    });
  };

  // Upload files
  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error("Yüklenecek dosya seçin");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      
      // Add files to form data
      files.forEach((fileItem, index) => {
        if (fileItem.status === 'pending') {
          if (multiple) {
            formData.append('files', fileItem.file);
          } else {
            formData.append('file', fileItem.file);
          }
        }
      });

      // Update file status to uploading
      setFiles(prev => prev.map(f => 
        f.status === 'pending' ? { ...f, status: 'uploading' } : f
      ));

      // Call upload handler
      const result = await onUpload(formData, (progressData) => {
        // Update progress for all uploading files
        setUploadProgress(progressData);
        setFiles(prev => prev.map(f => {
          if (f.status === 'uploading') {
            return { ...f, progress: progressData.progress || 0 };
          }
          return f;
        }));
      });

      // Update files with upload results
      if (result && result.files) {
        setFiles(prev => prev.map((f, index) => {
          if (f.status === 'uploading' && result.files[index]) {
            return {
              ...f,
              status: 'completed',
              progress: 100,
              url: result.files[index].url,
              thumbnailUrl: result.files[index].thumbnailUrl,
            };
          }
          return f;
        }));
      } else if (result && result.url) {
        // Single file upload
        setFiles(prev => prev.map(f => 
          f.status === 'uploading' ? {
            ...f,
            status: 'completed',
            progress: 100,
            url: result.url,
            thumbnailUrl: result.thumbnailUrl,
          } : f
        ));
      }

      toast.success("Dosyalar başarıyla yüklendi!");

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || "Dosya yüklenirken hata oluştu");
      
      // Mark failed files
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' ? { ...f, status: 'error', progress: 0 } : f
      ));
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  // Clear all files
  const clearFiles = () => {
    files.forEach(f => {
      if (f.preview) {
        URL.revokeObjectURL(f.preview);
      }
    });
    setFiles([]);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Drag & Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-orange-500 bg-orange-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${files.length > 0 ? 'mb-6' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-4">
          {/* Upload Icon */}
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          {/* Upload Text */}
          <div>
            <p className="text-lg font-medium text-gray-700 mb-1">
              {uploadText}
            </p>
            <p className="text-sm text-gray-500">
              {uploadSubtext}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {multiple ? `En fazla ${maxFiles} dosya` : 'Tek dosya'} • 
              Maksimum {Math.round(maxFileSize / (1024 * 1024))}MB
            </p>
          </div>

          {/* Select Button */}
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            Dosya Seç
          </button>
        </div>
      </div>

      {/* File Previews */}
      {showPreviews && files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-700">
              Seçilen Dosyalar ({files.length})
            </h3>
            <button
              onClick={clearFiles}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Tümünü Temizle
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                {/* File Preview */}
                {fileItem.preview ? (
                  <div className="w-full h-32 mb-3 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={fileItem.preview}
                      alt={fileItem.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}

                {/* File Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {fileItem.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(fileItem.size)}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="ml-2 text-red-600 hover:text-red-700"
                      disabled={fileItem.status === 'uploading'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Status & Progress */}
                  <div className="space-y-1">
                    {fileItem.status === 'pending' && (
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                        Bekliyor
                      </div>
                    )}
                    
                    {fileItem.status === 'uploading' && (
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-blue-600">
                          <ModernLoader size={8} className="mr-2" />
                          Yükleniyor ({fileItem.progress}%)
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${fileItem.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {fileItem.status === 'completed' && (
                      <div className="flex items-center text-xs text-green-600">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Tamamlandı
                      </div>
                    )}
                    
                    {fileItem.status === 'error' && (
                      <div className="flex items-center text-xs text-red-600">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Hata
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          {files.some(f => f.status === 'pending') && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {files.filter(f => f.status === 'pending').length} dosya yüklenmeyi bekliyor
              </p>
              
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <>
                    <ModernLoader size={16} className="mr-2" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Dosyaları Yükle
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DragDropUpload; 