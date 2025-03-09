
import React, { useState } from 'react';
import { FormData, FormResponse } from '../types/form';
import { BarChart, DownloadIcon, BarChart2, PieChart } from 'lucide-react';

interface AnalyticsProps {
  form: FormData;
}

export function Analytics({ form }: AnalyticsProps) {
  const [viewMode, setViewMode] = useState<'summary' | 'individual'>('summary');
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  
  // Get response statistics
  const totalResponses = form.responses.length;
  
  // Calculate completion rate
  const completionRate = totalResponses > 0 
    ? Math.round((totalResponses / (totalResponses + 0)) * 100) 
    : 0;
  
  // Calculate average completion time (mock data for now)
  const avgCompletionTime = '2 minutes';
  
  // For quiz forms, calculate average score
  let avgScore = 0;
  let maxPossibleScore = 0;
  
  if (form.settings.isQuiz) {
    const totalScores = form.responses.reduce((sum, response) => sum + (response.score || 0), 0);
    avgScore = totalResponses > 0 ? Math.round(totalScores / totalResponses) : 0;
    
    // Calculate max possible score
    maxPossibleScore = form.questions.reduce((sum, q) => sum + (q.points || 0), 0);
  }
  
  // Function to export responses as CSV
  const exportCSV = () => {
    if (form.responses.length === 0) {
      alert('No responses to export');
      return;
    }
    
    // Create CSV headers
    const headers = ['Timestamp', 'Email'];
    form.questions.forEach(q => headers.push(q.question));
    
    // Create CSV rows
    const rows = form.responses.map(response => {
      const row = [
        new Date(response.submittedAt).toLocaleString(),
        response.answers.email || 'N/A'
      ];
      
      form.questions.forEach(question => {
        const answer = response.answers[question.id];
        if (Array.isArray(answer)) {
          row.push(answer.join(', '));
        } else if (answer !== undefined) {
          row.push(String(answer));
        } else {
          row.push('');
        }
      });
      
      return row;
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${form.title.replace(/\s+/g, '_')}_responses.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Function to render summary statistics
  const renderSummary = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700">Total Responses</h3>
          <p className="text-3xl font-bold text-blue-500">{totalResponses}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700">Completion Rate</h3>
          <p className="text-3xl font-bold text-green-500">{completionRate}%</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-700">Avg. Completion Time</h3>
          <p className="text-3xl font-bold text-purple-500">{avgCompletionTime}</p>
        </div>
        
        {form.settings.isQuiz && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 md:col-span-3">
            <h3 className="text-lg font-medium text-gray-700">Average Quiz Score</h3>
            <p className="text-3xl font-bold text-orange-500">
              {avgScore} / {maxPossibleScore} ({maxPossibleScore > 0 ? Math.round((avgScore / maxPossibleScore) * 100) : 0}%)
            </p>
          </div>
        )}
      </div>
      
      {form.questions.map((question, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium mb-4">{question.question}</h3>
          
          {question.type === 'multiple_choice' || question.type === 'checkboxes' || question.type === 'dropdown' ? (
            <div>
              {/* Simple bar chart representation */}
              {question.options?.map((option, i) => {
                // Count responses for this option
                const count = form.responses.filter(response => {
                  const answer = response.answers[question.id];
                  if (Array.isArray(answer)) {
                    return answer.includes(option);
                  }
                  return answer === option;
                }).length;
                
                const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
                
                return (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span>{option}</span>
                      <span className="text-gray-500">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic">Text responses not visualized</p>
          )}
        </div>
      ))}
    </div>
  );
  
  // Function to render individual responses
  const renderIndividualResponses = () => {
    if (form.responses.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No responses yet</p>
        </div>
      );
    }
    
    const response = selectedResponse 
      ? form.responses.find(r => r.id === selectedResponse) 
      : form.responses[0];
      
    if (!response) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex space-x-2 overflow-x-auto pb-4">
          {form.responses.map((r, i) => (
            <button
              key={r.id}
              onClick={() => setSelectedResponse(r.id)}
              className={`px-3 py-2 border rounded-md whitespace-nowrap ${
                r.id === (selectedResponse || form.responses[0]?.id)
                  ? 'bg-blue-500 text-white'
                  : 'bg-white'
              }`}
            >
              Response {i + 1}
            </button>
          ))}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Response Details</h3>
              <p className="text-sm text-gray-500">
                Submitted: {new Date(response.submittedAt).toLocaleString()}
              </p>
              {response.answers.email && (
                <p className="text-sm text-gray-500">
                  Email: {response.answers.email as string}
                </p>
              )}
            </div>
            
            {form.settings.isQuiz && (
              <div className="text-right">
                <p className="text-lg font-bold">
                  Score: {response.score || 0} / {response.maxScore || 0}
                </p>
                <p className="text-sm text-gray-500">
                  {response.maxScore ? Math.round(((response.score || 0) / response.maxScore) * 100) : 0}%
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {form.questions.map((question, index) => {
              const answer = response.answers[question.id];
              
              let displayAnswer = '';
              if (Array.isArray(answer)) {
                displayAnswer = answer.join(', ');
              } else if (answer !== undefined && answer !== null) {
                displayAnswer = String(answer);
              } else {
                displayAnswer = 'No answer';
              }
              
              // Determine if the answer is correct (for quiz)
              let isCorrect = null;
              if (form.settings.isQuiz && question.correctAnswer !== undefined) {
                if (Array.isArray(question.correctAnswer)) {
                  if (Array.isArray(answer)) {
                    isCorrect = 
                      question.correctAnswer.length === answer.length && 
                      question.correctAnswer.every(a => answer.includes(a));
                  } else {
                    isCorrect = false;
                  }
                } else {
                  isCorrect = answer === question.correctAnswer;
                }
              }
              
              return (
                <div key={index} className="border-t pt-4">
                  <h4 className="font-medium">
                    {question.question}
                    {form.settings.isQuiz && isCorrect !== null && (
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    )}
                  </h4>
                  <p className="mt-1">{displayAnswer}</p>
                  
                  {form.settings.isQuiz && question.feedback && !isCorrect && (
                    <p className="mt-1 text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                      <strong>Feedback:</strong> {question.feedback}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart className="w-5 h-5 text-blue-500" />
            Form Analytics
          </h2>
          
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              disabled={form.responses.length === 0}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                form.responses.length === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <DownloadIcon className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setViewMode('summary')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                viewMode === 'summary'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Summary
            </button>
            <button
              onClick={() => setViewMode('individual')}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                viewMode === 'individual'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Individual Responses
            </button>
          </div>
          
          {viewMode === 'summary' ? renderSummary() : renderIndividualResponses()}
        </div>
      </div>
    </div>
  );
}
