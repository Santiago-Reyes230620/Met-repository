import { GrammarExercise, ReadingPassage, ReadingQuestion, VocabularyExercise } from "@/lib/supabase/client";

const now = new Date().toISOString();

export const FALLBACK_GRAMMAR_EXERCISES: GrammarExercise[] = [
  {
    id: "fallback-grammar-1",
    question: "She ___ to the gym every morning.",
    options: ["go", "goes", "going", "gone"],
    correct_answer: "goes",
    explanation: "Use present simple third person singular: goes.",
    difficulty: "easy",
    category: "verb-tenses",
    created_at: now,
  },
  {
    id: "fallback-grammar-2",
    question: "If I ___ more time, I would learn French.",
    options: ["have", "had", "will have", "having"],
    correct_answer: "had",
    explanation: "Second conditional uses if + past simple, would + base verb.",
    difficulty: "medium",
    category: "conditionals",
    created_at: now,
  },
  {
    id: "fallback-grammar-3",
    question: "He is good ___ solving logic problems.",
    options: ["in", "at", "on", "for"],
    correct_answer: "at",
    explanation: "The correct collocation is good at.",
    difficulty: "easy",
    category: "prepositions",
    created_at: now,
  },
];

export const FALLBACK_VOCABULARY_EXERCISES: VocabularyExercise[] = [
  {
    id: "fallback-vocab-1",
    word: "meticulous",
    definition: "very careful and precise",
    options: ["careless", "meticulous", "brief", "unclear"],
    correct_answer: "meticulous",
    example_sentence: "She is meticulous when reviewing financial reports.",
    part_of_speech: "adjective",
    difficulty: "medium",
    category: "adjective",
    created_at: now,
  },
  {
    id: "fallback-vocab-2",
    word: "abundant",
    definition: "existing in large quantities",
    options: ["rare", "abundant", "empty", "scarce"],
    correct_answer: "abundant",
    example_sentence: "The region has abundant natural resources.",
    part_of_speech: "adjective",
    difficulty: "easy",
    category: "adjective",
    created_at: now,
  },
  {
    id: "fallback-vocab-3",
    word: "mitigate",
    definition: "to make less severe",
    options: ["increase", "ignore", "mitigate", "delay"],
    correct_answer: "mitigate",
    example_sentence: "The city planted trees to mitigate heat in summer.",
    part_of_speech: "verb",
    difficulty: "hard",
    category: "verb",
    created_at: now,
  },
];

const fallbackReadingPassage: ReadingPassage = {
  id: "fallback-reading-1",
  title: "Learning Through Practice",
  content:
    "Consistent practice is one of the most effective ways to improve language skills. Students who read daily, review vocabulary in context, and complete short grammar drills usually progress faster than those who study only once in a while. Small, frequent sessions reduce fatigue and improve retention over time.",
  difficulty: "easy",
  category: "academic",
  created_at: now,
};

const fallbackReadingQuestions: ReadingQuestion[] = [
  {
    id: "fallback-reading-q1",
    passage_id: fallbackReadingPassage.id,
    question: "What is the main idea of the passage?",
    options: [
      "Long study sessions are always better",
      "Language progress improves with consistent practice",
      "Vocabulary is not important",
      "Grammar should be avoided",
    ],
    correct_answer: "Language progress improves with consistent practice",
    question_type: "main-idea",
    created_at: now,
  },
  {
    id: "fallback-reading-q2",
    passage_id: fallbackReadingPassage.id,
    question: "Why are small sessions recommended?",
    options: [
      "They cost less",
      "They reduce fatigue and improve retention",
      "They replace reading",
      "They eliminate grammar",
    ],
    correct_answer: "They reduce fatigue and improve retention",
    question_type: "detail",
    created_at: now,
  },
];

export const FALLBACK_READING_CONTENT: Array<ReadingPassage & { questions: ReadingQuestion[] }> = [
  {
    ...fallbackReadingPassage,
    questions: fallbackReadingQuestions,
  },
];
