import React, { useState } from 'react';
import { FormQuestion } from '../types/form';
import { Trash2, GripVertical, AlertCircle, Plus } from 'lucide-react';

interface QuestionEditorProps {
  question: FormQuestion;
  onChange: (updatedQuestion: FormQuestion) => void;
  onDelete: () => void;
  index: number;
  isQuiz: boolean;
  defaultRequired: boolean;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

export function QuestionEditor({ 
  question, 
  onChange, 
  onDelete,
  index,
  isQuiz,
  defaultRequired,
  onDragStart,
  onDragOver,
  onDrop
}: QuestionEditorProps) {
  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...question, question: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as FormQuestion['type'];
    const updatedQuestion: FormQuestion = { 
      ...question, 
      type: newType,
      // Reset correct answer when changing type
      correctAnswer: undefined,
      // Add default settings for file upload
      ...(newType === 'file_upload' ? {
        fileTypes: ['.pdf', '.doc', '.docx', '.txt'],
        maxFileSize: 5 * 1024 * 1024 // 5MB
      } : {})
    };
    onChange(updatedQuestion);
  };

  const handleOptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const options = e.target.value.split('\n').filter(Boolean);
    onChange({ ...question, options });
  };

  const handleCorrectAnswerChange = (value: string | string[]) => {
    onChange({ ...question, correctAnswer: value });
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const points = parseInt(e.target.value) || 0;
    onChange({ ...question, points });
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...question, feedback: e.target.value });
  };

  const handleRequiredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Set the required property explicitly to override the default
    onChange({ ...question, required: e.target.checked });
  };

  // Determine if the question is required based on explicit setting or default
  const isRequired = question.required ?? defaultRequired;

  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
    >
      <div className="flex items-center gap-2 mb-4">
        <div 
          className="cursor-move p-1 hover:bg-gray-100 rounded"
          title="Drag to reorder"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={question.question}
          onChange={handleQuestionChange}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Question text"
        />
        <select
          value={question.type}
          onChange={handleTypeChange}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="short_answer">Short Answer</option>
          <option value="paragraph">Paragraph</option>
          <option value="multiple_choice">Multiple Choice</option>
          <option value="checkboxes">Checkboxes</option>
          <option value="dropdown">Dropdown</option>
          <option value="file_upload">File Upload</option>
          <option value="date">Date</option>
          <option value="time">Time</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isRequired}
            onChange={handleRequiredChange}
            className="rounded text-blue-500 focus:ring-blue-500"
          />
          Required
        </label>
        <button
          onClick={onDelete}
          className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {['multiple_choice', 'checkboxes', 'dropdown'].includes(question.type) && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Options (one per line):
            </label>
            <textarea
              value={question.options?.join('\n') || ''}
              onChange={handleOptionsChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter options, one per line"
            />
          </div>

          {isQuiz && question.options && question.options.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correct Answer:
                </label>
                {question.type === 'checkboxes' ? (
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={(question.correctAnswer as string[] || []).includes(option)}
                          onChange={(e) => {
                            const currentAnswers = (question.correctAnswer as string[] || []);
                            if (e.target.checked) {
                              handleCorrectAnswerChange([...currentAnswers, option]);
                            } else {
                              handleCorrectAnswerChange(currentAnswers.filter(a => a !== option));
                            }
                          }}
                          className="rounded text-blue-500 focus:ring-blue-500"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ) : (
                  <select
                    value={question.correctAnswer as string || ''}
                    onChange={(e) => handleCorrectAnswerChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select correct answer</option>
                    {question.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points:
                </label>
                <input
                  type="number"
                  value={question.points || 0}
                  onChange={handlePointsChange}
                  min="0"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback (shown after answering):
                </label>
                <textarea
                  value={question.feedback || ''}
                  onChange={handleFeedbackChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Optional feedback for this question"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {question.type === 'file_upload' && (
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allowed File Types (comma-separated, e.g., .pdf, .doc, .docx):
            </label>
            <input
              type="text"
              value={question.fileTypes?.join(', ') || ''}
              onChange={(e) => {
                const fileTypes = e.target.value.split(',').map(t => t.trim());
                onChange({ ...question, fileTypes });
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder=".pdf, .doc, .docx"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum File Size (MB):
            </label>
            <input
              type="number"
              value={question.maxFileSize ? Math.round(question.maxFileSize / (1024 * 1024)) : ''}
              onChange={(e) => {
                const sizeMB = parseInt(e.target.value);
                if (!isNaN(sizeMB)) {
                  onChange({ ...question, maxFileSize: sizeMB * 1024 * 1024 });
                }
              }}
              min="1"
              max="50"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5"
            />
          </div>
        </div>
      )}
    </div>
  );
}