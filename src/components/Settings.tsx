import React from 'react';
import { FormData, FormSettings, EmailCollectionType, ThemeColor, ThemeStyle } from '../types/form';
import { Settings as SettingsIcon, Mail, Edit3, UserCheck, Layout, CheckSquare, Lock, Sliders, Palette } from 'lucide-react';
import { LogoUpload } from './LogoUpload';

interface SettingsProps {
  form: FormData;
  onUpdate: (updatedForm: FormData) => void;
}

// Default theme settings for safety
const defaultTheme = {
  primaryColor: 'blue' as ThemeColor,
  style: 'classic' as ThemeStyle,
  darkMode: false,
  customHeader: '',
  customFooter: ''
};

export function Settings({ form, onUpdate }: SettingsProps) {
  // Ensure theme exists by merging with defaults
  const theme = {
    ...defaultTheme,
    ...(form.settings?.theme || {})
  };

  const updateSettings = (updates: Partial<FormSettings>) => {
    onUpdate({
      ...form,
      settings: {
        ...form.settings,
        ...updates,
        // Ensure theme is preserved when updating other settings
        theme: updates.theme || theme
      }
    });
  };

  const themeColors: { value: ThemeColor; label: string; class: string }[] = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'red', label: 'Red', class: 'bg-red-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  ];

  const themeStyles: { value: ThemeStyle; label: string }[] = [
    { value: 'classic', label: 'Classic' },
    { value: 'modern', label: 'Modern' },
    { value: 'minimal', label: 'Minimal' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-blue-500" />
            Form Settings
          </h2>
        </div>

        <div className="p-6 space-y-8">
          {/* Theme Settings */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-500" />
              Theme Customization
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block font-medium mb-2">Primary Color</label>
                <div className="flex gap-4">
                  {themeColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => updateSettings({
                        theme: { ...theme, primaryColor: color.value }
                      })}
                      className={`w-8 h-8 rounded-full ${color.class} ${
                        theme.primaryColor === color.value
                          ? 'ring-2 ring-offset-2 ring-gray-400'
                          : ''
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2">Theme Style</label>
                <div className="grid grid-cols-3 gap-4">
                  {themeStyles.map(style => (
                    <button
                      key={style.value}
                      onClick={() => {
                        console.log(`Changing theme style to: ${style.value}`);
                        updateSettings({
                          theme: { ...theme, style: style.value }
                        });
                      }}
                      className={`px-4 py-2 rounded-md border ${
                        theme.style === style.value
                          ? 'bg-blue-100 border-blue-300 font-medium'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Dark Mode</label>
                  <p className="text-sm text-gray-500">Enable dark theme for your form</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={theme.darkMode}
                    onChange={(e) => updateSettings({
                      theme: { ...theme, darkMode: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <LogoUpload
                theme={theme}
                onUpdate={(themeUpdates) => updateSettings({
                  theme: { ...theme, ...(themeUpdates.theme || {}) }
                })}
              />

              <div>
                <label className="block font-medium mb-2">Custom Header</label>
                <textarea
                  value={theme.customHeader}
                  onChange={(e) => updateSettings({
                    theme: { ...theme, customHeader: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter custom header HTML (optional)"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Custom Footer</label>
                <textarea
                  value={theme.customFooter}
                  onChange={(e) => updateSettings({
                    theme: { ...theme, customFooter: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter custom footer HTML (optional)"
                />
              </div>
            </div>
          </section>

          {/* Quiz Settings */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium">Quiz Settings</h3>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Make this a quiz</label>
                <p className="text-sm text-gray-500">Assign points and set correct answers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.settings.isQuiz}
                  onChange={(e) => updateSettings({ isQuiz: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </section>

          {/* Response Settings */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              Response Collection
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block font-medium mb-2">Collect email addresses</label>
                <select
                  value={form.settings.emailCollection}
                  onChange={(e) => updateSettings({ emailCollection: e.target.value as EmailCollectionType })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="do_not_collect">Do not collect</option>
                  <option value="verified">Verified</option>
                  <option value="responder_input">Responder input</option>
                </select>
              </div>

              {/* Send responders a copy option removed */}

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Allow response editing</label>
                  <p className="text-sm text-gray-500">Responses can be changed after submission</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.settings.allowResponseEditing}
                    onChange={(e) => updateSettings({ allowResponseEditing: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Limit to 1 response</label>
                  <p className="text-sm text-gray-500">Requires sign-in</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.settings.limitOneResponse}
                    onChange={(e) => updateSettings({ limitOneResponse: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Presentation Settings */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Layout className="w-5 h-5 text-blue-500" />
              Form Presentation
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Show progress bar</label>
                  <p className="text-sm text-gray-500">Display progress while filling the form</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.settings.showProgressBar}
                    onChange={(e) => updateSettings({ showProgressBar: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Shuffle question order</label>
                  <p className="text-sm text-gray-500">Randomize the order of questions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.settings.shuffleQuestions}
                    onChange={(e) => updateSettings({ shuffleQuestions: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div>
                <label className="block font-medium mb-2">Confirmation message</label>
                <textarea
                  value={form.settings.confirmationMessage}
                  onChange={(e) => updateSettings({ confirmationMessage: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter confirmation message..."
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Show link to submit another response</label>
                  <p className="text-sm text-gray-500">Allow multiple submissions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.settings.showSubmitAnother}
                    onChange={(e) => updateSettings({ showSubmitAnother: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Show results summary</label>
                  <p className="text-sm text-gray-500">Share results with respondents</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.settings.showResultsSummary}
                    onChange={(e) => updateSettings({ showResultsSummary: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Restrictions */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" />
              Restrictions
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Disable auto-save</label>
                <p className="text-sm text-gray-500">Turn off automatic saving of responses</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.settings.disableAutosave}
                  onChange={(e) => updateSettings({ disableAutosave: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </section>

          {/* Defaults */}
          <section className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-500" />
              Form Defaults
            </h3>
            
            <div className="space-y-6">
              

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Make questions required by default</label>
                  <p className="text-sm text-gray-500">New questions will be required</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.settings.defaultRequiredQuestions}
                    onChange={(e) => {
                      const isRequired = e.target.checked;
                      // Update all existing questions to match the new default
                      const updatedQuestions = form.questions.map(q => ({
                        ...q,
                        required: isRequired
                      }));
                      onUpdate({
                        ...form,
                        questions: updatedQuestions,
                        settings: {
                          ...form.settings,
                          defaultRequiredQuestions: isRequired
                        }
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}