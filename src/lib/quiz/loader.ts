import { QuizBank, QuizItem } from '@/types/quiz';
import quizzesData from '@/content/quizzes.json';

// Load the quiz bank from JSON
export async function loadQuizBank(): Promise<QuizBank> {
  return quizzesData as QuizBank;
}

// Get quiz questions for a specific rune
export function getRuneQuiz(id: string): QuizItem[] {
  const bank = quizzesData as QuizBank;
  return bank.runes[id] || [];
}

// Get quiz questions for a specific number
export function getNumberQuiz(id: number | string): QuizItem[] {
  const bank = quizzesData as QuizBank;
  const key = String(id);
  return bank.numbers[key] || [];
}

// Get all available rune quiz IDs
export function getAvailableRuneQuizIds(): string[] {
  const bank = quizzesData as QuizBank;
  return Object.keys(bank.runes);
}

// Get all available number quiz IDs
export function getAvailableNumberQuizIds(): string[] {
  const bank = quizzesData as QuizBank;
  return Object.keys(bank.numbers);
}
