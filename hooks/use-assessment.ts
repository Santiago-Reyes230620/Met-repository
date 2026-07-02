import { useState, useCallback } from 'react';
import { supabase, AssessmentResult } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AssessmentQuestion = {
  id: string;
  type: 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'speaking' | 'writing';
  question: string;
  options?: string[];
  correct_answer?: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

export const useAssessment = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<AssessmentResult | null>(null);

  const calculateScores = useCallback(
    (userAnswers: Record<string, string>): Partial<AssessmentResult> => {
      const questions = getAssessmentQuestions();
      const scoreByType: Record<string, { correct: number; total: number }> = {
        grammar: { correct: 0, total: 0 },
        vocabulary: { correct: 0, total: 0 },
        reading: { correct: 0, total: 0 },
        listening: { correct: 0, total: 0 },
        speaking: { correct: 0, total: 0 },
        writing: { correct: 0, total: 0 },
      };

      questions.forEach((q) => {
        scoreByType[q.type].total++;
        if (
          q.correct_answer &&
          userAnswers[q.id] &&
          userAnswers[q.id].toLowerCase() === q.correct_answer.toLowerCase()
        ) {
          scoreByType[q.type].correct++;
        }
      });

      const calculateScore = (type: string): number => {
        const { correct, total } = scoreByType[type];
        if (total === 0) return 0;
        // Scale to 0-10
        return (correct / total) * 10;
      };

      const scores = {
        grammar_score: parseFloat(calculateScore('grammar').toFixed(1)),
        vocabulary_score: parseFloat(calculateScore('vocabulary').toFixed(1)),
        reading_score: parseFloat(calculateScore('reading').toFixed(1)),
        listening_score: parseFloat(calculateScore('listening').toFixed(1)),
        speaking_score: parseFloat(calculateScore('speaking').toFixed(1)),
        writing_score: parseFloat(calculateScore('writing').toFixed(1)),
      };

      const overallScore =
        (scores.grammar_score +
          scores.vocabulary_score +
          scores.reading_score +
          scores.listening_score +
          scores.speaking_score +
          scores.writing_score) /
        6;

      return {
        ...scores,
        overall_score: parseFloat(overallScore.toFixed(1)),
      };
    },
    []
  );

  const submitAssessment = useCallback(
    async (userAnswers: Record<string, string>) => {
      if (!user) return;

      try {
        setLoading(true);
        const scores = calculateScores(userAnswers);

        const { data, error } = await supabase
          .from('assessment_results')
          .insert([
            {
              user_id: user.id,
              ...scores,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Update profile with scores and assessment completion
        await supabase
          .from('profiles')
          .update({
            grammar_score: scores.grammar_score,
            vocabulary_score: scores.vocabulary_score,
            reading_score: scores.reading_score,
            listening_score: scores.listening_score,
            speaking_score: scores.speaking_score,
            writing_score: scores.writing_score,
            has_completed_assessment: true,
          })
          .eq('id', user.id);

        setResults(data);
        return data;
      } catch (error) {
        console.error('Error submitting assessment:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user, calculateScores]
  );

  return {
    loading,
    currentIndex,
    answers,
    results,
    setCurrentIndex,
    setAnswers,
    submitAssessment,
  };
};

export const getAssessmentQuestions = (): AssessmentQuestion[] => [
  // Grammar - 5 questions
  {
    id: 'gram_1',
    type: 'grammar',
    question: 'She ____ to the store every day.',
    options: ['go', 'goes', 'going', 'gone'],
    correct_answer: 'goes',
    difficulty: 'easy',
  },
  {
    id: 'gram_2',
    type: 'grammar',
    question: 'If I ____ you, I would accept the offer.',
    options: ['am', 'was', 'were', 'been'],
    correct_answer: 'were',
    difficulty: 'medium',
  },
  {
    id: 'gram_3',
    type: 'grammar',
    question: 'The book ____ on the table for three weeks.',
    options: ['is', 'has been', 'was', 'had been'],
    correct_answer: 'has been',
    difficulty: 'medium',
  },
  {
    id: 'gram_4',
    type: 'grammar',
    question: '____ he finish his work, he can leave.',
    options: ['Once', 'Until', 'While', 'During'],
    correct_answer: 'Once',
    difficulty: 'hard',
  },
  {
    id: 'gram_5',
    type: 'grammar',
    question: 'I wish I ____ more attention in class.',
    options: ['paid', 'pay', 'had paid', 'would pay'],
    correct_answer: 'had paid',
    difficulty: 'hard',
  },

  // Vocabulary - 5 questions
  {
    id: 'vocab_1',
    type: 'vocabulary',
    question: 'What is the meaning of "abundant"?',
    options: ['scarce', 'plentiful', 'limited', 'rare'],
    correct_answer: 'plentiful',
    difficulty: 'easy',
  },
  {
    id: 'vocab_2',
    type: 'vocabulary',
    question: 'The speaker\'s ____ words moved the audience.',
    options: ['eloquent', 'awkward', 'silent', 'unclear'],
    correct_answer: 'eloquent',
    difficulty: 'medium',
  },
  {
    id: 'vocab_3',
    type: 'vocabulary',
    question: 'His ____ behavior caused trouble at the office.',
    options: ['diligent', 'oblivious', 'meticulous', 'prudent'],
    correct_answer: 'oblivious',
    difficulty: 'medium',
  },
  {
    id: 'vocab_4',
    type: 'vocabulary',
    question: 'The company had to ____ its operations due to lack of funds.',
    options: ['expand', 'augment', 'curtail', 'amplify'],
    correct_answer: 'curtail',
    difficulty: 'hard',
  },
  {
    id: 'vocab_5',
    type: 'vocabulary',
    question: 'Her ____ for excellence was evident in her work.',
    options: ['apathy', 'propensity', 'penchant', 'both b and c'],
    correct_answer: 'both b and c',
    difficulty: 'hard',
  },

  // Reading - 5 questions
  {
    id: 'read_1',
    type: 'reading',
    question: 'What is the main idea of a text about climate change?',
    options: [
      'Weather patterns',
      'Global temperature rise and its impacts',
      'Seasonal changes',
      'Historical climate data',
    ],
    correct_answer: 'Global temperature rise and its impacts',
    difficulty: 'easy',
  },
  {
    id: 'read_2',
    type: 'reading',
    question: 'According to the passage, why is exercise important?',
    options: [
      'To lose weight',
      'For physical and mental health',
      'To look good',
      'To compete with others',
    ],
    correct_answer: 'For physical and mental health',
    difficulty: 'medium',
  },
  {
    id: 'read_3',
    type: 'reading',
    question: 'What can be inferred from the authors tone?',
    options: ['angry', 'informative', 'uncertain', 'bitter'],
    correct_answer: 'informative',
    difficulty: 'medium',
  },
  {
    id: 'read_4',
    type: 'reading',
    question: 'The word "paradox" in the passage means:',
    options: [
      'a contradiction',
      'a question',
      'a comparison',
      'a statement',
    ],
    correct_answer: 'a contradiction',
    difficulty: 'hard',
  },
  {
    id: 'read_5',
    type: 'reading',
    question: 'Which statement best supports the authors argument?',
    options: [
      'Evidence A',
      'Evidence B',
      'Evidence C',
      'None of the above',
    ],
    correct_answer: 'Evidence B',
    difficulty: 'hard',
  },

  // Listening - 5 questions (text-based for now)
  {
    id: 'list_1',
    type: 'listening',
    question: 'Listen and identify the main topic discussed.',
    options: ['Sports', 'Technology', 'Food', 'Travel'],
    correct_answer: 'Technology',
    difficulty: 'easy',
  },
  {
    id: 'list_2',
    type: 'listening',
    question: 'What time was mentioned in the conversation?',
    options: ['2 PM', '3 PM', '4 PM', '5 PM'],
    correct_answer: '3 PM',
    difficulty: 'medium',
  },
  {
    id: 'list_3',
    type: 'listening',
    question: 'How did the speaker feel about the event?',
    options: ['Disappointed', 'Excited', 'Neutral', 'Angry'],
    correct_answer: 'Excited',
    difficulty: 'medium',
  },
  {
    id: 'list_4',
    type: 'listening',
    question: 'What action will the speaker take next?',
    options: [
      'Call someone',
      'Send an email',
      'Schedule a meeting',
      'Take notes',
    ],
    correct_answer: 'Schedule a meeting',
    difficulty: 'hard',
  },
  {
    id: 'list_5',
    type: 'listening',
    question: 'What is implied about the future plans?',
    options: [
      'They will be postponed',
      'They will proceed as planned',
      'They are uncertain',
      'They have been cancelled',
    ],
    correct_answer: 'They will proceed as planned',
    difficulty: 'hard',
  },

  // Speaking - 5 questions (self-assessment format)
  {
    id: 'speak_1',
    type: 'speaking',
    question: 'Can you introduce yourself in English clearly?',
    options: ['Not at all', 'Somewhat', 'Yes, confidently', 'Fluently'],
    correct_answer: 'Yes, confidently',
    difficulty: 'easy',
  },
  {
    id: 'speak_2',
    type: 'speaking',
    question: 'Can you express opinions and justify them?',
    options: ['Not at all', 'With difficulty', 'Reasonably well', 'Fluently'],
    correct_answer: 'Reasonably well',
    difficulty: 'medium',
  },
  {
    id: 'speak_3',
    type: 'speaking',
    question: 'How well do you participate in group discussions?',
    options: ['Avoid speaking', 'Participate minimally', 'Participate actively', 'Lead discussions'],
    correct_answer: 'Participate actively',
    difficulty: 'medium',
  },
  {
    id: 'speak_4',
    type: 'speaking',
    question: 'Can you handle unexpected questions smoothly?',
    options: ['No', 'Sometimes', 'Usually', 'Always'],
    correct_answer: 'Usually',
    difficulty: 'hard',
  },
  {
    id: 'speak_5',
    type: 'speaking',
    question: 'Do you speak without frequent pauses or hesitations?',
    options: ['Rarely', 'Sometimes', 'Often', 'Almost always'],
    correct_answer: 'Often',
    difficulty: 'hard',
  },

  // Writing - 5 questions
  {
    id: 'write_1',
    type: 'writing',
    question: 'Can you write simple, grammatically correct sentences?',
    options: ['Not well', 'Somewhat', 'Yes, usually', 'Consistently'],
    correct_answer: 'Yes, usually',
    difficulty: 'easy',
  },
  {
    id: 'write_2',
    type: 'writing',
    question: 'Can you organize your ideas clearly in a paragraph?',
    options: ['Struggle', 'With some effort', 'Reasonably well', 'Excellently'],
    correct_answer: 'Reasonably well',
    difficulty: 'medium',
  },
  {
    id: 'write_3',
    type: 'writing',
    question: 'How is your vocabulary range in writing?',
    options: ['Limited', 'Basic', 'Good variety', 'Sophisticated'],
    correct_answer: 'Good variety',
    difficulty: 'medium',
  },
  {
    id: 'write_4',
    type: 'writing',
    question: 'Can you write an essay with clear structure and argumentation?',
    options: ['No', 'Basic structure', 'Good structure', 'Excellent structure'],
    correct_answer: 'Good structure',
    difficulty: 'hard',
  },
  {
    id: 'write_5',
    type: 'writing',
    question: 'How often do you need to revise your writing for errors?',
    options: ['Very often', 'Often', 'Occasionally', 'Rarely'],
    correct_answer: 'Occasionally',
    difficulty: 'hard',
  },
];
