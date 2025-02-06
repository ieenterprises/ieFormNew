import React from 'react';
import { FormQuestion, FormResponse, FormData } from '../types/form';
import { Upload, Calendar, Clock } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/theme.css';

interface FormFieldProps {
  question: FormQuestion;
  value: FormResponse[string];
  onChange: (value: FormResponse[string]) => void;
  form?: FormData;
  showScore?: boolean;
}

export function FormField({ question, value, onChange, form, showScore = false }: FormFieldProps) {
  const renderQuizFeedback = () => {
    if (!form?.settings.isQuiz || !showScore) return null;

    const isCorrect = Array.isArray(question.correctAnswer)
      ? JSON.stringify(value) === JSON.stringify(question.correctAnswer)
      : value === question.correctAnswer;

    return (
      <div className={`mt-2 p-2 rounded ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
        <p className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
          {isCorrect ? 'Correct!' : 'Incorrect'} 
          {question.points && ` (${isCorrect ? question.points : 0}/${question.points} points)`}
        </p>
        {question.feedback && (
          <p className="text-sm text-gray-600 mt-1">{question.feedback}</p>
        )}
      </div>
    );
  };

  switch (question.type) {
    case 'short_answer':
      return (
        <div>
          <input
            type="text"
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border themed-input focus:outline-none focus:ring-2"
            placeholder="Your answer"
            required={question.required}
          />
          {renderQuizFeedback()}
        </div>
      );

    case 'paragraph':
      return (
        <div>
          <textarea
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border themed-input focus:outline-none focus:ring-2 min-h-[100px]"
            placeholder="Your answer"
            required={question.required}
          />
          {renderQuizFeedback()}
        </div>
      );

    case 'multiple_choice':
      return (
        <div>
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="text-primary-color focus:ring-primary-color themed-input"
                  required={question.required}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {renderQuizFeedback()}
        </div>
      );

    case 'checkboxes':
      return (
        <div>
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={(value as string[] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = (value as string[]) || [];
                    if (e.target.checked) {
                      onChange([...currentValues, option]);
                    } else {
                      onChange(currentValues.filter(v => v !== option));
                    }
                  }}
                  className="text-primary-color focus:ring-primary-color themed-input"
                  required={question.required && (value as string[] || []).length === 0}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {renderQuizFeedback()}
        </div>
      );

    case 'dropdown':
      return (
        <div>
          <select
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border themed-input focus:outline-none focus:ring-2"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {renderQuizFeedback()}
        </div>
      );

    case 'file_upload':
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-center w-full">
            <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-gray-500 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary-color hover:bg-primary-light transition-colors themed-input">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <span className="text-sm font-medium mb-1">
                {value ? (value as File).name : 'Click to upload file'}
              </span>
              <span className="text-xs text-gray-500">
                {question.fileTypes?.join(', ')} allowed
              </span>
              <input
                type="file"
                className="hidden"
                accept={question.fileTypes?.join(',')}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (question.maxFileSize && file.size > question.maxFileSize) {
                      alert('File size exceeds the maximum allowed size.');
                      return;
                    }
                    onChange(file);
                  }
                }}
                required={question.required}
              />
            </label>
          </div>
          {value && (
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
              <span className="text-sm text-gray-600">
                Selected: {(value as File).name}
              </span>
              <button
                onClick={() => onChange('')}
                className="text-red-500 hover:text-red-600 text-sm"
              >
                Remove
              </button>
            </div>
          )}
          {question.maxFileSize && (
            <p className="text-sm text-gray-500">
              Maximum file size: {Math.round(question.maxFileSize / (1024 * 1024))}MB
            </p>
          )}
        </div>
      );

    case 'date':
      return (
        <div className="relative">
          <DatePicker
            selected={value ? new Date(value as string) : null}
            onChange={(date) => onChange(date ? date.toISOString() : '')}
            dateFormat="MMMM d, yyyy"
            className="w-full px-3 py-2 border themed-input focus:outline-none focus:ring-2"
            placeholderText="Select a date"
            isClearable
            showPopperArrow={false}
            required={question.required}
          />
          <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        </div>
      );

    case 'time':
      return (
        <div className="relative">
          <DatePicker
            selected={value ? new Date(`1970-01-01T${value as string}`) : null}
            onChange={(date) => {
              if (date) {
                const timeString = date.toTimeString().split(' ')[0].slice(0, 5);
                onChange(timeString);
              } else {
                onChange('');
              }
            }}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa"
            className="w-full px-3 py-2 border themed-input focus:outline-none focus:ring-2"
            placeholderText="Select a time"
            isClearable
            required={question.required}
          />
          <Clock className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        </div>
      );

    default:
      return null;
  }
}