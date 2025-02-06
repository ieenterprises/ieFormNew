import React, { useState } from 'react';
import { X, Link, Code } from 'lucide-react';

interface ShareModalProps {
  formId: string;
  onClose: () => void;
}

export function ShareModal({ formId, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState<'link' | 'embed' | null>(null);
  
  const formUrl = `${window.location.origin}/form/${formId}`;
  const embedCode = `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const copyToClipboard = async (text: string, type: 'link' | 'embed') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Share Form</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formUrl}
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-gray-50"
              />
              <button
                onClick={() => copyToClipboard(formUrl, 'link')}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Link className="w-4 h-4" />
                {copied === 'link' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Embed Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={embedCode}
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-gray-50 font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(embedCode, 'embed')}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Code className="w-4 h-4" />
                {copied === 'embed' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}