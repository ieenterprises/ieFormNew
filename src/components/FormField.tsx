import React from 'react';
import { FormQuestion } from '../types/form';

interface FormFieldProps {
  question: FormQuestion;
  value: any;
  onChange: (value: any) => void;
}

export function FormField({ question, value, onChange }: FormFieldProps) {
  switch (question.type) {
    case 'short_answer':
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your answer"
        />
      );

    case 'paragraph':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          placeholder="Your answer"
        />
      );

    case 'multiple_choice':
      return (
        <div className="space-y-2">
          {question.options?.map((option, i) => (
            <div key={i} className="flex items-center">
              <input
                type="radio"
                id={`${question.id}-option-${i}`}
                name={question.id}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                required={question.required && !value}
                className="mr-2"
              />
              <label htmlFor={`${question.id}-option-${i}`}>{option}</label>
            </div>
          ))}
        </div>
      );

    case 'checkboxes':
      return (
        <div className="space-y-2">
          {question.options?.map((option, i) => (
            <div key={i} className="flex items-center">
              <input
                type="checkbox"
                id={`${question.id}-option-${i}`}
                value={option}
                checked={Array.isArray(value) && value.includes(option)}
                onChange={(e) => {
                  const selected = Array.isArray(value) ? [...value] : [];
                  if (e.target.checked) {
                    onChange([...selected, option]);
                  } else {
                    onChange(selected.filter(item => item !== option));
                  }
                }}
                className="mr-2"
              />
              <label htmlFor={`${question.id}-option-${i}`}>{option}</label>
            </div>
          ))}
        </div>
      );

    case 'dropdown':
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Select an option</option>
          {question.options?.map((option, i) => (
            <option key={i} value={option}>{option}</option>
          ))}
        </select>
      );

    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );

    case 'time':
      return (
        <input
          type="time"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={question.required}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );

    case 'file_upload':
      return (
        <div>
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onChange(e.target.files[0]);
              }
            }}
            required={question.required}
            accept={question.fileTypes?.join(',')}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {question.maxFileSize && (
            <p className="text-xs text-gray-500 mt-1">
              Maximum file size: {(question.maxFileSize / (1024 * 1024)).toFixed(1)}MB
            </p>
          )}
        </div>
      );

    default:
      return (
        <div className="text-red-500">Unsupported question type: {question.type}</div>
      );
  }
}