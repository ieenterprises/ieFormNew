import { FormQuestion } from '../types/form';

export function calculateProgress(
  responses: Record<string, string | string[] | number | Date>,
  questions: FormQuestion[]
): number {
  // Only count required questions for progress calculation
  const requiredQuestions = questions.filter(q => q.required);

  if (requiredQuestions.length === 0) return 100;

  let answeredRequired = 0;

  for (const question of requiredQuestions) {
    const response = responses[question.id];

    if (response !== undefined && response !== null) {
      // Check if response is not empty
      if (
        (typeof response === 'string' && response.trim() !== '') ||
        (Array.isArray(response) && response.length > 0) ||
        (typeof response === 'number') ||
        (response instanceof Date)
      ) {
        answeredRequired++;
      }
    }
  }

  return Math.round((answeredRequired / requiredQuestions.length) * 100);
}