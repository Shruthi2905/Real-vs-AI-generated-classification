import { File, Upload } from 'lucide-react';
import { useState } from 'react';

interface UploadBoxProps {
  type: 'text' | 'audio' | 'image';
  title: string;
  accept: string;
}

export function UploadBox({ type, title, accept }: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    const fileExtension = droppedFile?.name.split('.').pop()?.toLowerCase();
    const acceptedExtensions = accept.split(',').map(ext => ext.trim().replace('.', ''));
    
    if (droppedFile && fileExtension && acceptedExtensions.includes(fileExtension)) {
      setFile(droppedFile);
    } else {
      alert(`Please upload a valid ${type} file. Accepted formats: ${accept}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  return (
    <div
      className={`p-6 rounded-lg border-2 border-dashed transition-all duration-300 ${
        isDragging
          ? 'border-pink bg-pink/5 scale-105'
          : 'border-pink-light/30 bg-navy-dark/50 hover:border-pink/30'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-pink/5">
          {file ? (
            <File className="w-8 h-8 text-pink-light" />
          ) : (
            <Upload className="w-8 h-8 text-pink-light" />
          )}
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-pink-light">{title}</h3>
          {file ? (
            <p className="text-sm text-pink-light/70 mt-1">{file.name}</p>
          ) : (
            <>
              <p className="text-sm text-pink-light/70 mt-1">
                Drag and drop or click to upload
              </p>
              <p className="text-xs text-pink-light/50 mt-1">
                Accepted formats: {accept}
              </p>
            </>
          )}
        </div>
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id={`file-${type}`}
        />
        <label
          htmlFor={`file-${type}`}
          className="px-4 py-2 bg-pink hover:bg-pink-dark text-navy-dark rounded-md cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Select {type}
        </label>
      </div>
    </div>
  );
}