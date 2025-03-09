
import React, { useState } from 'react';
import { Settings, Save } from 'react-feather';

interface EmailSettingsProps {
  serviceId: string;
  templateId: string;
  userId: string;
  onSave: (settings: { serviceId: string; templateId: string; userId: string }) => void;
}

const EmailSettings: React.FC<EmailSettingsProps> = ({ 
  serviceId, 
  templateId, 
  userId, 
  onSave 
}) => {
  const [newServiceId, setNewServiceId] = useState(serviceId);
  const [newTemplateId, setNewTemplateId] = useState(templateId);
  const [newUserId, setNewUserId] = useState(userId);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onSave({
      serviceId: newServiceId,
      templateId: newTemplateId,
      userId: newUserId
    });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm px-3 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
      >
        <Settings size={14} />
        Configure Email Service
      </button>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-blue-500" />
        Email Service Settings
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">EmailJS Service ID</label>
          <input
            type="text"
            value={newServiceId}
            onChange={(e) => setNewServiceId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="service_xxxxxxx"
          />
          <p className="text-xs text-gray-500 mt-1">
            Create an EmailJS account and service at emailjs.com
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">EmailJS Template ID</label>
          <input
            type="text"
            value={newTemplateId}
            onChange={(e) => setNewTemplateId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="template_xxxxxxx"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">EmailJS User ID</label>
          <input
            type="text"
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="user_xxxxxxxxxxxxxxxx"
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
          >
            <Save size={16} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;
