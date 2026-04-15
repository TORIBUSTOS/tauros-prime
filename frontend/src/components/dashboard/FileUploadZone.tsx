'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileCheck, Loader2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface FileUploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onUpload, isUploading }) => {
  const { currentTheme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    const validExtensions = ['.xlsx', '.csv'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(extension)) {
      alert('Formato no válido. Use .xlsx o .csv');
      return;
    }
    
    onUpload(file);
  };

  return (
    <div 
      className={`
        upload-zone relative h-full transition-all duration-500 ease-out cursor-pointer group rounded-2xl
        border-2 border-dashed flex items-center justify-center overflow-hidden
        ${isDragging 
          ? 'border-imperial-bronze bg-imperial-bronze/10 scale-[1.01] shadow-[0_0_30px_rgba(192,152,145,0.15)]' 
          : 'border-white/10 bg-imperial-surface/30 hover:border-imperial-bronze/40 hover:bg-white/5'}
        ${isUploading ? 'uploading cursor-wait border-imperial-bronze/60' : ''}
        glass-panel rim-light
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".xlsx,.csv" 
        className="hidden" 
      />
      
      {/* Background Glow Effect */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none
        bg-[radial-gradient(circle_at_center,_var(--imperial-bronze)_0%,_transparent_70%)]
      `} />

      <div className={`
        upload-content flex flex-col items-center gap-4 text-center p-8 transition-all duration-500
        ${isUploading ? 'animate-pulse scale-95' : 'group-hover:scale-105'}
      `}>
        <div className={`
          upload-icon w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
          ${isUploading ? 'bg-imperial-bronze text-white rotate-12' : 'bg-white/5 text-imperial-bronze group-hover:bg-imperial-bronze group-hover:text-white'}
        `}>
          {isUploading ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : isDragging ? (
            <FileCheck className="w-7 h-7" />
          ) : (
            <Upload className="w-7 h-7" />
          )}
        </div>
        
        <div className="upload-text flex flex-col gap-1.5">
          <span className="primary-text text-xs font-black text-imperial-text-prime uppercase tracking-[0.2em]">
            {isUploading ? 'Sincronizando Bóveda...' : 'Cargar Extracto Bancario'}
          </span>
          <span className="secondary-text text-[10px] text-imperial-text-muted/50 uppercase tracking-widest font-bold">
            Arrastra aquí o haz clic (XLSX, CSV)
          </span>
        </div>
      </div>
    </div>
  );
};

export default FileUploadZone;
