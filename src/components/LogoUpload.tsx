
import React, { useState } from 'react';
import { FormTheme } from '../types/form';
import { Upload, Trash2 } from 'lucide-react';

interface LogoUploadProps {
  theme: FormTheme;
  onUpdate: (logoSettings: Partial<FormTheme>) => void;
}

export function LogoUpload({ theme, onUpdate }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Please upload an image under 2MB.');
      return;
    }
    
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      alert('Unsupported file type. Please upload a PNG or JPG image.');
      return;
    }
    
    setUploading(true);
    
    // Convert file to base64 for storage
    const reader = new FileReader();
    reader.onload = (event) => {
      const logoUrl = event.target?.result as string;
      
      // Create an image element to get dimensions
      const img = new Image();
      img.onload = () => {
        onUpdate({
          logo: {
            url: logoUrl,
            width: img.width,
            height: img.height,
            alignment: 'center'
          }
        });
        setUploading(false);
      };
      img.src = logoUrl;
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleRemoveLogo = () => {
    onUpdate({ logo: undefined });
  };
  
  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
    if (!theme.logo) return;
    
    onUpdate({
      logo: {
        ...theme.logo,
        alignment
      }
    });
  };
  
  return (
    <div className="space-y-4">
      <label className="block font-medium mb-2">Business Logo</label>
      
      {theme.logo ? (
        <div className="space-y-4">
          <div className="flex justify-center">
            <img 
              src={theme.logo.url} 
              alt="Form logo" 
              className="max-h-20 object-contain"
            />
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => handleAlignmentChange('left')}
              className={`px-3 py-1 border rounded-md ${
                theme.logo.alignment === 'left' ? 'bg-blue-100 border-blue-500' : ''
              }`}
            >
              Left
            </button>
            <button
              type="button"
              onClick={() => handleAlignmentChange('center')}
              className={`px-3 py-1 border rounded-md ${
                theme.logo.alignment === 'center' ? 'bg-blue-100 border-blue-500' : ''
              }`}
            >
              Center
            </button>
            <button
              type="button"
              onClick={() => handleAlignmentChange('right')}
              className={`px-3 py-1 border rounded-md ${
                theme.logo.alignment === 'right' ? 'bg-blue-100 border-blue-500' : ''
              }`}
            >
              Right
            </button>
          </div>
          
          <button
            type="button"
            onClick={handleRemoveLogo}
            className="px-3 py-1 text-red-500 border border-red-300 rounded-md flex items-center gap-2 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Remove Logo
          </button>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => document.getElementById('logo-upload')?.click()}
        >
          <Upload className="w-8 h-8 mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Click to upload logo</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
          
          <input
            id="logo-upload"
            type="file"
            accept="image/png, image/jpeg, image/gif"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          
          {uploading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Uploading...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
