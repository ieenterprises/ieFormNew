import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { FormTheme } from '../types/form';

interface LogoUploadProps {
  theme: FormTheme;
  onUpdate: (logo: FormTheme['logo']) => void;
}

export function LogoUpload({ theme, onUpdate }: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should be less than 2MB');
        return;
      }

      // Create object URL for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        // Create an image element to get dimensions
        const img = new Image();
        img.onload = () => {
          // Calculate dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          const maxWidth = 200;
          const maxHeight = 100;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          onUpdate({
            url: event.target?.result as string,
            width: Math.round(width),
            height: Math.round(height),
            alignment: theme.logo?.alignment || 'left'
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    onUpdate(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
    if (theme.logo) {
      onUpdate({
        ...theme.logo,
        alignment
      });
    }
  };

  return (
    <div className="space-y-4">
      <label className="block font-medium mb-2">Business Logo</label>
      
      {theme.logo ? (
        <div className="space-y-4">
          <div className="relative inline-block">
            <img
              src={theme.logo.url}
              alt="Business Logo"
              style={{
                width: theme.logo.width,
                height: theme.logo.height,
                objectFit: 'contain'
              }}
              className="rounded-md"
            />
            <button
              onClick={handleRemoveLogo}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="Remove logo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleAlignmentChange('left')}
              className={`px-3 py-1 rounded ${
                theme.logo.alignment === 'left'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Left
            </button>
            <button
              onClick={() => handleAlignmentChange('center')}
              className={`px-3 py-1 rounded ${
                theme.logo.alignment === 'center'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Center
            </button>
            <button
              onClick={() => handleAlignmentChange('right')}
              className={`px-3 py-1 rounded ${
                theme.logo.alignment === 'right'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Right
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full">
          <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-gray-500 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Upload className="w-8 h-8 mb-2 text-gray-400" />
            <span className="text-sm font-medium mb-1">Click to upload logo</span>
            <span className="text-xs text-gray-500">PNG, JPG up to 2MB</span>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}
    </div>
  );
}