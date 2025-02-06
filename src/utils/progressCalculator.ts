import { FormQuestion } from '../types/form';

export function calculateProgress(
  responses: Record<string, any>,
  questions: FormQuestion[]
): number {
  if (!questions.length) return 0;

  let answeredCount = 0;
  let totalRequired = 0;

  questions.forEach(question => {
    // Only count required questions for progress
    if (question.required) {
      totalRequired++;
      const response = responses[question.id];
      
      // Check if the response exists and is valid based on the question type
      let isAnswered = false;
      
      switch (question.type) {
        case 'short_answer':
        case 'paragraph':
          isAnswered = typeof response === 'string' && response.trim() !== '';
          break;
          
        case 'multiple_choice':
        case 'dropdown':
          isAnswered = typeof response === 'string' && response !== '';
          break;
          
        case 'checkboxes':
          isAnswered = Array.isArray(response) && response.length > 0;
          break;
          
        case 'file_upload':
          isAnswered = response instanceof File || (typeof response === 'object' && response !== null);
          break;
          
        case 'date':
          isAnswered = response && !isNaN(new Date(response).getTime());
          break;
          
        case 'time':
          isAnswered = typeof response === 'string' && /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(response);
          break;
      }
      
      if (isAnswered) {
        answeredCount++;
      }
    }
  });

  // Calculate progress percentage
  return totalRequired === 0 ? 100 : Math.round((answeredCount / totalRequired) * 100);
}