export type QuestionType = 
  | 'short_answer'
  | 'paragraph'
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'file_upload'
  | 'date'
  | 'time';

export type EmailCollectionType = 'do_not_collect' | 'verified' | 'responder_input';

export type ThemeColor = 'blue' | 'green' | 'purple' | 'red' | 'orange';
export type ThemeStyle = 'classic' | 'modern' | 'minimal';

export interface FormTheme {
  primaryColor: ThemeColor;
  style: ThemeStyle;
  darkMode: boolean;
  customHeader?: string;
  customFooter?: string;
  logo?: {
    url: string;
    width: number;
    height: number;
    alignment: 'left' | 'center' | 'right';
  };
}

export interface FormQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  required?: boolean;
  fileTypes?: string[];
  maxFileSize?: number;
  correctAnswer?: string | string[];
  points?: number;
  feedback?: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  answers: Record<string, string | string[] | number | Date>;
  submittedAt: string;
  score?: number;
  maxScore?: number;
}

export interface FormSettings {
  isQuiz: boolean;
  emailCollection: EmailCollectionType;
  sendResponseCopy: boolean;
  allowResponseEditing: boolean;
  limitOneResponse: boolean;
  showProgressBar: boolean;
  shuffleQuestions: boolean;
  confirmationMessage: string;
  showSubmitAnother: boolean;
  showResultsSummary: boolean;
  theme: FormTheme;
  disableAutosave: boolean;
  defaultEmailCollection: EmailCollectionType;
  defaultRequiredQuestions: boolean;
}

export interface FormData {
  id: string;
  title: string;
  questions: FormQuestion[];
  createdAt: string;
  updatedAt: string;
  responses: FormResponse[];
  settings: FormSettings;
}