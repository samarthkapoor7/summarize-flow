import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUploader = ({ onFileUpload, isLoading }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // File size limit in bytes (10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Max size is 10MB.');
      return;
    }
    onFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Max size is 10MB.');
      return;
    }
    onFileUpload(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center bg-white shadow-sm transition-colors duration-200 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload className="w-12 h-12 text-blue-500 mb-4" />
      <p className="text-lg font-medium mb-2">Drag & drop your audio file here, or click to browse</p>
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isLoading}
        className="relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 w-full max-w-xs mb-4"
      >
        Browse Files
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        accept="audio/*"
        disabled={isLoading}
      />
      <p className="text-xs text-gray-500 mt-4">
        Supported formats: WAV, MP3, MP4, M4A, OGG (max 10MB)
      </p>
    </div>
  );
};

export default FileUploader;