
import React, { useCallback, useRef } from 'react';
import type { FileInfo } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { CheckIcon } from './icons/CheckIcon';

interface UploadPanelProps {
  imageA: FileInfo | null;
  setImageA: React.Dispatch<React.SetStateAction<FileInfo | null>>;
  imageB: FileInfo | null;
  setImageB: React.Dispatch<React.SetStateAction<FileInfo | null>>;
  disabled: boolean;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const FileInput: React.FC<{
  label: string;
  imageInfo: FileInfo | null;
  onFileSelect: (info: FileInfo) => void;
  disabled: boolean;
}> = ({ label, imageInfo, onFileSelect, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/tiff' || file.name.toLowerCase().endsWith('.tif') || file.name.toLowerCase().endsWith('.tiff'))) {
      onFileSelect({
        file: file,
        name: file.name,
        size: formatBytes(file.size),
      });
    } else if (file) {
      alert('Please select a valid GeoTIFF file (.tif or .tiff)');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if(disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file && (file.type === 'image/tiff' || file.name.toLowerCase().endsWith('.tif') || file.name.toLowerCase().endsWith('.tiff'))) {
        onFileSelect({
            file: file,
            name: file.name,
            size: formatBytes(file.size),
        });
    } else if (file) {
        alert('Please select a valid GeoTIFF file (.tif or .tiff)');
    }
  };

  return (
    <div>
      <h3 className="font-semibold mb-2 text-lg">{label}</h3>
      <label
        htmlFor={label.replace(' ', '-')}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-32 px-4 transition bg-gray-700 border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-cyan-400 focus:outline-none ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        {imageInfo ? (
          <div className="text-center">
            <CheckIcon className="w-8 h-8 text-green-400 mx-auto" />
            <p className="font-medium text-gray-200 truncate max-w-full">{imageInfo.name}</p>
            <p className="text-sm text-gray-400">{imageInfo.size}</p>
          </div>
        ) : (
          <div className="text-center">
            <UploadIcon className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-400">
              <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">GeoTIFF (.tif, .tiff)</p>
          </div>
        )}
      </label>
      <input
        ref={inputRef}
        id={label.replace(' ', '-')}
        type="file"
        accept=".tif,.tiff,image/tiff"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};


const UploadPanel: React.FC<UploadPanelProps> = ({ imageA, setImageA, imageB, setImageB, disabled }) => {
  return (
    <div className="space-y-6">
      <FileInput label="Image A (Left)" imageInfo={imageA} onFileSelect={setImageA} disabled={disabled} />
      <FileInput label="Image B (Right)" imageInfo={imageB} onFileSelect={setImageB} disabled={disabled} />
    </div>
  );
};

export default UploadPanel;
