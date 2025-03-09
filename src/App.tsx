import React, { useState, useEffect } from 'react';
import { FormQuestion, FormResponse, FormData, EmailCollectionType, FormTheme } from './types/form';
import { parseQuestions } from './utils/questionParser';
import { calculateProgress } from './utils/progressCalculator';
import { FormField } from './components/FormField';
import { QuestionEditor } from './components/QuestionEditor';
import { ShareModal } from './components/ShareModal';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { FileText, Send, Plus, Share2, PencilLine, Eye, BarChart, ArrowLeft, Trash2, Settings as SettingsIcon, CheckCircle, XCircle } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/theme.css';

// Default theme settings
const defaultTheme: FormTheme = {
  primaryColor: 'blue',
  style: 'classic',
  darkMode: false,
  customHeader: '',
  customFooter: ''
};

function App() {
  const [input, setInput] = useState('');
  const [forms, setForms] = useState<FormData[]>(() => {
    const saved = localStorage.getItem('forms');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentForm, setCurrentForm] = useState<FormData | null>(null);
  const [responses, setResponses] = useState<Record<string, string | string[] | number | Date>>({});
  const [view, setView] = useState<'list' | 'input' | 'editor' | 'preview' | 'analytics' | 'settings' | 'confirmation'>('list');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [draggedQuestionIndex, setDraggedQuestionIndex] = useState<number | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    localStorage.setItem('forms', JSON.stringify(forms));
  }, [forms]);

  const handleGenerate = () => {
    const parsedQuestions = parseQuestions(input);

    // Log the parsed questions for debugging
    console.log('Parsed questions:', parsedQuestions);

    if (parsedQuestions.length === 0) {
      alert('No questions were detected. Please check your input format and try again.');
      return;
    }

    const newForm: FormData = {
      id: Math.random().toString(36).substring(2),
      title: 'Untitled Form',
      questions: parsedQuestions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
      settings: {
        isQuiz: false,
        emailCollection: 'do_not_collect' as EmailCollectionType,
        sendResponseCopy: false,
        allowResponseEditing: false,
        limitOneResponse: false,
        showProgressBar: true,
        shuffleQuestions: false,
        confirmationMessage: 'Your response has been recorded.',
        showSubmitAnother: true,
        showResultsSummary: false,
        disableAutosave: false,
        defaultEmailCollection: 'do_not_collect' as EmailCollectionType,
        defaultRequiredQuestions: false,
        theme: { ...defaultTheme }
      }
    };
    setCurrentForm(newForm);
    setForms(prev => [...prev, newForm]);
    setView('editor');
    setResponses({});
  };

  const handleSaveForm = () => {
    if (currentForm) {
      setForms(prev => 
        prev.map(form => 
          form.id === currentForm.id ? currentForm : form
        )
      );
    }
  };

  const handleDeleteForm = (formId: string) => {
    setForms(prev => prev.filter(form => form.id !== formId));
    setShowDeleteConfirm(null);
  };

  const handleQuestionChange = (index: number, updatedQuestion: FormQuestion) => {
    if (!currentForm) return;
    const newQuestions = [...currentForm.questions];
    newQuestions[index] = updatedQuestion;
    setCurrentForm(prev => ({
      ...prev!,
      questions: newQuestions,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleQuestionDelete = (index: number) => {
    if (!currentForm) return;
    setCurrentForm(prev => ({
      ...prev!,
      questions: prev!.questions.filter((_, i) => i !== index),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddQuestion = () => {
    if (!currentForm) return;
    setCurrentForm(prev => ({
      ...prev!,
      questions: [
        ...prev!.questions,
        {
          id: Math.random().toString(36).substring(2),
          type: 'short_answer',
          question: 'New Question',
          required: prev!.settings.defaultRequiredQuestions
        },
      ],
      updatedAt: new Date().toISOString(),
    }));
  };

  const checkPreviousSubmission = (email: string) => {
    if (!currentForm) return false;
    return currentForm.responses.some(response => 
      response.answers.email === email
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentForm) return;

    let emailToStore = '';
    // Check email if required
    if (currentForm.settings.emailCollection !== 'do_not_collect') {
      const email = responses['email'] as string;
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }
      emailToStore = email;
      // If email collection is verified, we would verify here
      if (currentForm.settings.emailCollection === 'verified') {
        if (checkPreviousSubmission(email)) {
          alert('You have already submitted a response with this email');
          return;
        }
      }
    }


    // Create new response object
    const newResponse: FormResponse = {
      id: Math.random().toString(36).substring(2),
      formId: currentForm.id,
      email: responses.email as string || '',
      answers: responses,
      submittedAt: new Date().toISOString(),
    };

    // Email sending functionality removed

    // Update form with new response
    setCurrentForm(prev => ({
      ...prev!,
      responses: [...prev!.responses, newResponse]
    }));

    // Store the submitted email for checking future submissions
    setSubmittedEmail(emailToStore);
    setHasSubmitted(true);

    // Clear responses
    setResponses({});

    // Show confirmation page
    setView('confirmation');
  };

  const handleOpenForm = (form: FormData) => {
    setCurrentForm(form);
    setResponses({});
    setView('preview');
  };

  const handleStartNewResponse = () => {
    if (currentForm?.settings.limitOneResponse && submittedEmail) {
      if (checkPreviousSubmission(submittedEmail)) {
        alert('You have already submitted a response to this form.');
        return;
      }
    }

    setResponses({});
    setView('preview');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {view !== 'list' && (
                <button
                  onClick={() => {
                    handleSaveForm();
                    setView('list');
                    setCurrentForm(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-500 mr-2" />
                <h1 className="text-3xl font-bold text-gray-900">Form Builder</h1>
              </div>
            </div>
            {currentForm && view !== 'list' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setView('editor')}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    view === 'editor'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 border'
                  }`}
                >
                  <PencilLine className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setView('preview')}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    view === 'preview'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 border'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => setView('analytics')}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    view === 'analytics'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 border'
                  }`}
                >
                  <BarChart className="w-4 h-4" />
                  Analytics
                </button>
                <button
                  onClick={() => setView('settings')}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                    view === 'settings'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 border'
                  }`}
                >
                  <SettingsIcon className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            )}
          </div>

          {view === 'list' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <button
                  onClick={() => {
                    setInput('');
                    setView('input');
                  }}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create New Form
                </button>
              </div>

              {forms.map(form => (
                <div
                  key={form.id}
                  className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between"
                >
                  <div>
                    <h2 className="text-xl font-semibold">{form.title}</h2>
                    <p className="text-gray-500">
                      {form.responses.length} responses · Created{' '}
                      {new Date(form.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenForm(form)}
                      className="px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(form.id)}
                      className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'input' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Paste your questions below (one per line):
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] mb-4"
                placeholder="Example of multiple-choice questions:
What is your Name? John, Mike, Queen
What is your Gender? Male, Female, Other
What is your Age Range? 15-19 years, 20-24 years, 25-29 years"
              />
              <div className="text-sm text-gray-600 mb-4">
                <p><strong>Tip:</strong> For multiple-choice questions, type your question followed by a question mark, then list the options separated by commas.</p>
              </div>
              <button
                onClick={handleGenerate}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Generate Form
              </button>
            </div>
          )}

          {currentForm && view === 'preview' && (
            <div 
              className={`
                themed-form rounded-lg shadow-md p-6
                ${currentForm.settings.theme.style || 'classic'}
                ${currentForm.settings.theme.darkMode ? 'theme-dark' : ''}
                theme-${currentForm.settings.theme.primaryColor || 'blue'}
              `}
            >
              <h1 className="text-2xl font-bold mb-6">{currentForm.title}</h1>

              {/* Display custom logo if present */}
              {currentForm.settings.theme.logo && (
                <div className={`mb-6 text-${currentForm.settings.theme.logo.alignment}`}>
                  <img 
                    src={currentForm.settings.theme.logo.url} 
                    alt="Form logo" 
                    className="max-h-20 inline-block"
                    style={{
                      maxWidth: '100%',
                      height: 'auto'
                    }}
                  />
                </div>
              )}

              {/* Display custom header if present */}
              {currentForm.settings.theme.customHeader && (
                <div 
                  className="mb-6"
                  dangerouslySetInnerHTML={{ __html: currentForm.settings.theme.customHeader }}
                />
              )}

              {/* Show progress bar if enabled */}
              {currentForm.settings.showProgressBar && (
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-300 bg-${currentForm.settings.theme.primaryColor}-500`}
                      style={{ 
                        width: `${calculateProgress(responses, currentForm.questions)}%`
                      }}
                    />
                  </div>
                  <div className="text-right text-sm mt-1 text-gray-600 dark:text-gray-300">
                    Progress: {calculateProgress(responses, currentForm.questions)}%
                  </div>
                </div>
              )}

              <form 
                onSubmit={handleSubmit} 
                className="space-y-6"
                autoSave={currentForm.settings.disableAutosave ? 'off' : 'on'}
              >
                {/* Shuffle questions if enabled */}
                {(currentForm.settings.shuffleQuestions 
                  ? [...currentForm.questions].sort(() => Math.random() - 0.5) 
                  : currentForm.questions
                ).map((question) => (
                  <div key={question.id} className="space-y-2">
                    <label className="block text-sm font-medium">
                      {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}

                      {/* Show points if this is a quiz */}
                      {currentForm.settings.isQuiz && question.points && (
                        <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {question.points} {question.points === 1 ? 'point' : 'points'}
                        </span>
                      )}
                    </label>
                    <FormField
                      question={question}
                      value={responses[question.id]}
                      onChange={(value) => 
                        setResponses(prev => ({
                          ...prev,
                          [question.id]: value
                        }))
                      }
                    />
                  </div>
                ))}

                {/* Add email collection if enabled */}
                {currentForm.settings.emailCollection !== 'do_not_collect' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Email Address
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                      value={responses['email'] as string || ''}
                      onChange={(e) => setResponses(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                    />

                    {/* Send copy option removed */}
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    Submit Form
                  </button>
                </div>
              </form>

              {/* Show custom footer if present */}
              {currentForm.settings.theme.customFooter && (
                <div 
                  className="mt-6"
                  dangerouslySetInnerHTML={{ __html: currentForm.settings.theme.customFooter }}
                />
              )}
            </div>
          )}

          {currentForm && view === 'editor' && (
            <div className="space-y-4">
              <input
                type="text"
                value={currentForm.title}
                onChange={(e) => setCurrentForm(prev => ({ ...prev!, title: e.target.value }))}
                className="w-full px-4 py-2 text-2xl font-bold border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 bg-transparent"
                placeholder="Form Title"
              />

              <div className="space-y-4">
                {currentForm.questions.map((question, index) => (
                  <QuestionEditor
                    key={question.id}
                    question={question}
                    onChange={(updatedQuestion) => handleQuestionChange(index, updatedQuestion)}
                    onDelete={() => handleQuestionDelete(index)}
                    index={index}
                    isQuiz={currentForm.settings.isQuiz}
                    defaultRequired={currentForm.settings.defaultRequiredQuestions}
                    onDragStart={(e) => setDraggedQuestionIndex(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedQuestionIndex === null) return;
                      const questions = [...currentForm.questions];
                      const [removed] = questions.splice(draggedQuestionIndex, 1);
                      questions.splice(index, 0, removed);
                      setCurrentForm(prev => ({
                        ...prev!,
                        questions,
                        updatedAt: new Date().toISOString(),
                      }));
                      setDraggedQuestionIndex(null);
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleAddQuestion}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Question
              </button>
            </div>
          )}

          {currentForm && view === 'analytics' && (
            <Analytics form={currentForm} />
          )}

          {currentForm && view === 'settings' && (
            <Settings form={currentForm} onUpdate={setCurrentForm} />
          )}

          {currentForm && view === 'confirmation' && (
            <div className={`
              themed-form rounded-lg shadow-md p-6 text-center
              ${currentForm.settings.theme.style}
              ${currentForm.settings.theme.darkMode ? 'theme-dark' : ''}
              theme-${currentForm.settings.theme.primaryColor}
            `}>
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
                <p className="text-lg mb-6">{currentForm.settings.confirmationMessage}</p>

                {currentForm.settings.showSubmitAnother && !currentForm.settings.limitOneResponse && (
                  <button
                    onClick={handleStartNewResponse}
                    className={`px-6 py-3 text-white rounded-md hover:bg-${currentForm.settings.theme.primaryColor}-600 transition-colors bg-${currentForm.settings.theme.primaryColor}-500 flex items-center gap-2`}
                  >
                    Start New Response
                  </button>
                )}

                {currentForm.settings.limitOneResponse && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-md">
                    <div className="flex items-center gap-2 text-gray-600">
                      <XCircle className="w-5 h-5" />
                      <p>You can only submit one response to this form.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {showShareModal && currentForm && (
            <ShareModal
              formId={currentForm.id}
              onClose={() => setShowShareModal(false)}
            />
          )}

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-semibold mb-4">Delete Form</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this form? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteForm(showDeleteConfirm)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;