import { FormQuestion } from '../types/form';

export function parseQuestions(input: string): FormQuestion[] {
  if (!input.trim()) return [];

  const lines = input.split('\n').filter(line => line.trim());
  const questions: FormQuestion[] = [];

  for (const line of lines) {
    // Check if the line contains a question and options
    const questionMatch = line.match(/(.*?)\s*\?\s*(.*)/);

    if (questionMatch) {
      const [, questionText, optionsText] = questionMatch;

      if (optionsText && optionsText.trim()) {
        // This is likely a multiple choice question
        // Parse options - they could be separated by commas or tabs
        const options = optionsText.split(/[,\t]/)
          .map(option => option.trim())
          .filter(option => option.length > 0);

        if (options.length > 0) {
          // Create a multiple choice question
          questions.push({
            id: Math.random().toString(36).substring(2),
            type: 'multiple_choice',
            question: `${questionText.trim()}?`,
            options: options,
            required: true
          });
          continue;
        }
      }

      // Default to short answer if no options or couldn't parse options
      questions.push({
        id: Math.random().toString(36).substring(2),
        type: 'short_answer',
        question: `${questionText.trim()}?`,
        required: true
      });
    } else {
      // Check if there are options listed separately with tab or multiple spaces
      const optionsMatch = line.match(/(.*?)(?:\t|\s{2,})(.*)/);

      if (optionsMatch) {
        const [, questionText, optionsText] = optionsMatch;

        // Parse options - could be separated by tabs or multiple spaces
        const options = optionsText.split(/[\t\s{2,}]/)
          .map(option => option.trim())
          .filter(option => option.length > 0);

        if (options.length > 0) {
          questions.push({
            id: Math.random().toString(36).substring(2),
            type: 'multiple_choice',
            question: questionText.trim(),
            options: options,
            required: true
          });
        } else {
          // Default to short answer
          questions.push({
            id: Math.random().toString(36).substring(2),
            type: 'short_answer',
            question: questionText.trim(),
            required: true
          });
        }
      } else {
        // Just a regular question without options
        questions.push({
          id: Math.random().toString(36).substring(2),
          type: 'short_answer',
          question: line.trim(),
          required: true
        });
      }
    }
  }

  return questions;
}

function createQuestionObject(questionText: string, options: string[]): FormQuestion {
  // Generate a unique ID
  const id = Math.random().toString(36).substr(2, 9);

  // Clean up the question text
  const cleanQuestionText = questionText.trim();

  // For this format, we'll always create multiple choice questions
  // since they come with A), B), C), D) options
  return {
    id,
    type: 'multiple_choice',
    question: cleanQuestionText,
    options: options,
    required: true, // Make these questions required by default
    points: 1 // Assign 1 point by default for quiz questions
  };
}

function parseQuestion(line: string): FormQuestion | null {
  // Remove numbers at the start of the line (e.g., "1. ", "2. ")
  const cleanLine = line.replace(/^\d+[\.\)]\s*/, '').trim();

  // First try to split by question mark to separate question from options
  let parts = cleanLine.split('?');

  if (parts.length < 2) {
    // If no question mark, try to identify the question and options using other delimiters
    parts = cleanLine.split(/\s*:\s*/);
  }

  const questionText = parts[0].trim() + (parts.length > 1 ? '?' : '');
  const optionsText = parts.length > 1 ? parts[1] : '';

  // Generate a unique ID
  const id = Math.random().toString(36).substr(2, 9);

  // Parse options
  let options: string[] = [];

  if (optionsText) {
    // Try to match options in the format "A) option, B) option" etc.
    const optionMatches = optionsText.match(/[A-D]\)\s*[^,\n]+/g);
    if (optionMatches) {
      options = optionMatches.map(opt => opt.replace(/^[A-D]\)\s*/, '').trim());
    } else {
      // Fall back to comma or space separation
      options = optionsText
        .split(/,|\s{2,}/)
        .map(opt => opt.trim())
        .filter(opt => opt.length > 0);
    }
  }

  // For questions with lettered options, always use multiple choice
  if (options.length > 0 && optionsText.match(/[A-D]\)/)) {
    return {
      id,
      type: 'multiple_choice',
      question: questionText,
      options,
      required: true,
      points: 1
    };
  }

  // Detect question type based on content and options
  if (options.length === 0) {
    if (questionText.toLowerCase().includes('describe') ||
        questionText.toLowerCase().includes('explain') ||
        questionText.toLowerCase().includes('elaborate')) {
      return {
        id,
        type: 'paragraph',
        question: questionText
      };
    }
    return {
      id,
      type: 'short_answer',
      question: questionText
    };
  }

  // Check for rating or satisfaction questions
  if (options.some(opt =>
    opt.toLowerCase().includes('satisfied') ||
    opt.toLowerCase().includes('dissatisfied') ||
    opt.toLowerCase().includes('rating'))) {
    return {
      id,
      type: 'multiple_choice',
      question: questionText,
      options
    };
  }

  // Check for age ranges
  if (options.some(opt => opt.includes('years') || opt.includes('-'))) {
    return {
      id,
      type: 'dropdown',
      question: questionText,
      options
    };
  }

  // Check for binary choices (like yes/no, gender)
  if (options.length === 2) {
    return {
      id,
      type: 'multiple_choice',
      question: questionText,
      options
    };
  }

  // For questions with many options, use dropdown
  if (options.length > 4) {
    return {
      id,
      type: 'dropdown',
      question: questionText,
      options
    };
  }

  // Default to multiple choice for other cases with options
  return {
    id,
    type: 'multiple_choice',
    question: questionText,
    options
  };
}