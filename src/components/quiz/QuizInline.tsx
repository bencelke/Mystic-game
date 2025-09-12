'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getRuneQuiz, getNumberQuiz } from '@/lib/quiz/loader';
import { seededShuffle, scoreQuiz, generateQuizSeed } from '@/lib/quiz/utils';
import { recordQuizAttempt, addLocalXP } from '@/lib/progress/local';
import { t, getCurrentLocale } from '@/lib/i18n/quiz';
import { QuizItem, QuizResult, QuizAnswer } from '@/types/quiz';
import { cn } from '@/lib/utils';

interface QuizInlineProps {
  kind: 'rune' | 'number';
  id: string | number;
  onFinish?: (result: QuizResult) => void;
  max?: number;
  className?: string;
}

export function QuizInline({ 
  kind, 
  id, 
  onFinish, 
  max = 5, 
  className 
}: QuizInlineProps) {
  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const locale = getCurrentLocale();

  // Load and shuffle questions
  useEffect(() => {
    const loadQuestions = () => {
      const rawQuestions = kind === 'rune' 
        ? getRuneQuiz(String(id))
        : getNumberQuiz(id);
      
      if (rawQuestions.length === 0) {
        setIsLoading(false);
        return;
      }

      const seed = generateQuizSeed(kind, id);
      const shuffled = seededShuffle(rawQuestions, seed);
      const limited = shuffled.slice(0, max);
      
      setQuestions(limited);
      setIsLoading(false);
    };

    loadQuestions();
  }, [kind, id, max]);

  const handleAnswer = (answerIndex: number) => {
    if (isAnswered) return;

    const question = questions[currentQuestion];
    const isCorrect = answerIndex === question.answer;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const answer: QuizAnswer = {
      questionIndex: currentQuestion,
      selectedAnswer: answerIndex,
      correct: isCorrect,
      explanation: question.explanation,
    };

    setAnswers(prev => [...prev, answer]);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const quizResult = scoreQuiz(answers);
    setResult(quizResult);
    setIsComplete(true);

    // Record the attempt
    recordQuizAttempt(kind, id, { 
      correct: quizResult.correct, 
      total: quizResult.total 
    });

    // Award XP
    addLocalXP(quizResult.xpEarned);

    // Fire analytics event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('quiz_finish', {
        detail: { kind, id, correct: quizResult.correct, total: quizResult.total }
      }));
    }

    onFinish?.(quizResult);
  };

  const retakeQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setAnswers([]);
    setIsComplete(false);
    setResult(null);
  };

  if (isLoading) {
    return (
      <Card className={cn("border-border bg-card", className)}>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">Loading quiz...</div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className={cn("border-border bg-card", className)}>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">{t('noQuestions', {}, locale)}</div>
        </CardContent>
      </Card>
    );
  }

  if (isComplete && result) {
    return (
      <Card className={cn("border-border bg-card", className)}>
        <CardHeader>
          <CardTitle className="text-yellow-400 text-center">
            {t('quizComplete', {}, locale)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-foreground text-lg">
              {t('score', {
                correct: result.correct,
                total: result.total,
                percent: result.percent
              }, locale)}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-yellow-400 text-black">
                {t('xpEarned', { xp: result.xpEarned }, locale)}
              </Badge>
              {result.percent === 100 && (
                <Badge variant="secondary" className="text-yellow-400 border-yellow-500/30">
                  {t('perfectBonus', {}, locale)}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={retakeQuiz} className="flex-1">
              {t('retakeQuiz', {}, locale)}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Card className={cn("border-border bg-card", className)}>
      <CardHeader>
        <CardTitle className="text-yellow-400">
          {t('title', {}, locale)} — {kind === 'rune' ? 'Rune' : 'Number'} {id}
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('question', {}, locale)} {currentQuestion + 1} {t('of', {}, locale)} {questions.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">
            {question.q}
          </h3>
          
          <div className="space-y-2">
            {question.choices.map((choice, index) => (
              <Button
                key={index}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left h-auto p-4",
                  isAnswered && index === question.answer && "bg-green-500/20 border-green-500 text-green-300",
                  isAnswered && index === selectedAnswer && index !== question.answer && "bg-red-500/20 border-red-500 text-red-300",
                  !isAnswered && "hover:bg-muted/50"
                )}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered}
              >
                <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                {choice}
              </Button>
            ))}
          </div>

          {isAnswered && (
            <div className="space-y-2">
              <div className={cn(
                "p-3 rounded-lg text-sm font-medium",
                selectedAnswer === question.answer 
                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                  : "bg-red-500/20 text-red-300 border border-red-500/30"
              )}>
                {selectedAnswer === question.answer 
                  ? t('correct', {}, locale)
                  : t('incorrect', {}, locale)
                }
              </div>
              
              {question.explanation && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    {t('explanation', {}, locale)}:
                  </div>
                  <div className="text-sm text-foreground">
                    {question.explanation}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {isAnswered && (
          <div className="flex justify-end">
            <Button onClick={handleNext} className="bg-yellow-400 text-black hover:bg-yellow-300">
              {currentQuestion < questions.length - 1 
                ? t('next', {}, locale)
                : t('finish', {}, locale)
              }
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}