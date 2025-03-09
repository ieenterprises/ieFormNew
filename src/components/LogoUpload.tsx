
import React, { useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { FormTheme } from '../types/form';

interface LogoUploadProps {
  theme: FormTheme;
  onUpdate: (logoSettings: Partial<FormTheme>) => void;
}

export function LogoUpload({ theme, onUpdate }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size should not exceed 2MB');
      return;
    }

    setUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Ensure the base64 data is valid
        if (base64String && base64String.startsWith('data:image/')) {
          onUpdate({
            logo: {
              url: base64String,
              alignment: theme.logo?.alignment || 'center'
            }
          });
          console.log('Logo updated:', base64String.substring(0, 50) + '...');
        } else {
          console.error('Invalid image data format');
          alert('Failed to process image. Please try another file.');
        }
        setUploading(false);
      };

      reader.onerror = () => {
        console.error('Error reading file');
        alert('Error reading file. Please try again.');
        setUploading(false);
      };
    } catch (error) {
      console.error('Error uploading logo:', error);
      setUploading(false);
      alert('Failed to upload logo. Please try again.');
    }
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
          <div className={`text-${theme.logo.alignment || 'center'}`}>
            <img 
              src={theme.logo.url} 
              alt="Form logo" 
              className="max-h-20 inline-block"
              style={{
                maxWidth: '100%',
                height: 'auto'
              }}
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

          <div className="flex justify-center mt-2">
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="px-3 py-1 text-red-500 border border-red-300 rounded-md flex items-center gap-2 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Remove Logo
            </button>
          </div>
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
