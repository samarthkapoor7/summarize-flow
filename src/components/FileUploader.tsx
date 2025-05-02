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

  const validateFile = (file: File) => {
    const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/ogg'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid audio file");
      return false;
    }
    if (file.size > 25 * 1024 * 1024) { // 25MB limit
      toast.error("File size exceeds 25MB limit");
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileUpload(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileUpload(file);
      }
    }
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
        Supported formats: WAV, MP3, MP4, M4A, OGG (max 25MB)
      </p>
    </div>
  );
};

export default FileUploader;