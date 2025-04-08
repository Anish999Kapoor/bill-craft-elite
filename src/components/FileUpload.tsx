
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileUploadProps {
  id: string;
  label: string;
  onFileSelect: (file: File) => void;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ id, label, onFileSelect, className }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onFileSelect(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        id={id}
        className="sr-only"
        onChange={handleFileChange}
        accept="image/*"
      />
      {previewUrl ? (
        <div className="relative group">
          <img 
            src={previewUrl} 
            alt={label} 
            className="object-contain w-full h-full" 
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
            <label htmlFor={id} className="cursor-pointer text-white">
              Change
            </label>
          </div>
        </div>
      ) : (
        <label 
          htmlFor={id}
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 cursor-pointer hover:bg-invoice-light transition-colors duration-200"
        >
          <Upload className="w-6 h-6 text-invoice-dark mb-2" />
          <span className="text-sm text-gray-600">{label}</span>
        </label>
      )}
    </div>
  );
};

export default FileUpload;
