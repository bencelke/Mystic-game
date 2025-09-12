import { RuneId } from '@/content/runes-ids';
import { NumberId } from '@/content/numbers-ids';

export interface QuizItem {
  q: string;
  choices: string[];
  answer: number;
  explanation?: string;
}

export interface QuizBank {
  runes: Record<string, QuizItem[]>;
  numbers: Record<string, QuizItem[]>;
}

export interface QuizStats {
  attempts: number;
  best: number; // best score as percentage
  last: number; // last score as percentage
  correct: number; // total correct answers
  total: number; // total questions answered
}

export interface QuizResult {
  correct: number;
  total: number;
  percent: number;
  xpEarned: number;
}

export interface QuizAnswer {
  questionIndex: number;
  selectedAnswer: number;
  correct: boolean;
  explanation?: string;
}

export interface QuizSession {
  kind: 'rune' | 'number';
  id: string | number;
  questions: QuizItem[];
  answers: QuizAnswer[];
  currentQuestion: number;
  completed: boolean;
  result?: QuizResult;
}

export interface LocalProgress {
  unlockedRunes: RuneId[];
  unlockedNumbers: NumberId[];
  quiz: {
    runes: Record<string, QuizStats>;
    numbers: Record<string, QuizStats>;
  };
  xp?: number;
}