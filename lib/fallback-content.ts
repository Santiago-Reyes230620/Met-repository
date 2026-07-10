import { GrammarExercise, ReadingPassage, ReadingQuestion, VocabularyExercise } from "@/lib/supabase/client";

const now = new Date().toISOString();

const rotateOptions = (options: string[], shift: number): string[] => {
  const n = options.length;
  if (n === 0) return options;
  const offset = ((shift % n) + n) % n;
  return [...options.slice(offset), ...options.slice(0, offset)];
};

const GRAMMAR_TARGET = 2400;
const VOCAB_TARGET = 2200;
const READING_TARGET = 800;

const grammarTemplates: Array<{
  stem: string;
  options: string[];
  correct: string;
  explanation: string;
  category: "verb-tenses" | "conditionals" | "articles" | "prepositions";
}> = [
  {
    stem: "{subject} ___ to the office every weekday.",
    options: ["go", "goes", "going", "gone"],
    correct: "goes",
    explanation: "Use present simple third-person singular with he/she/it forms.",
    category: "verb-tenses",
  },
  {
    stem: "If we ___ earlier, we would catch the first train.",
    options: ["leave", "left", "will leave", "had left"],
    correct: "left",
    explanation: "Second conditional uses if + past simple, would + base verb.",
    category: "conditionals",
  },
  {
    stem: "She bought ___ umbrella because it was raining heavily.",
    options: ["a", "an", "the", "no article"],
    correct: "an",
    explanation: "Use 'an' before words that begin with a vowel sound.",
    category: "articles",
  },
  {
    stem: "The report is divided ___ three sections.",
    options: ["in", "at", "into", "on"],
    correct: "into",
    explanation: "The correct collocation is divided into.",
    category: "prepositions",
  },
  {
    stem: "By next month, they ___ the prototype.",
    options: ["finish", "finished", "will finish", "will have finished"],
    correct: "will have finished",
    explanation: "Future perfect describes completion before a future point.",
    category: "verb-tenses",
  },
  {
    stem: "If she ___ more confident, she would speak up in meetings.",
    options: ["is", "was", "were", "has been"],
    correct: "were",
    explanation: "Use subjunctive 'were' in hypothetical conditionals.",
    category: "conditionals",
  },
  {
    stem: "We visited ___ university near the city center.",
    options: ["a", "an", "the", "no article"],
    correct: "a",
    explanation: "Use 'a' before consonant sounds.",
    category: "articles",
  },
  {
    stem: "He is responsible ___ updating the dashboard.",
    options: ["for", "to", "with", "about"],
    correct: "for",
    explanation: "The correct structure is responsible for + gerund.",
    category: "prepositions",
  },
];

const grammarSubjects = [
  "The manager",
  "My brother",
  "The student",
  "The engineer",
  "Our coach",
  "The analyst",
  "The doctor",
  "The designer",
];

export const FALLBACK_GRAMMAR_EXERCISES: GrammarExercise[] = Array.from(
  { length: GRAMMAR_TARGET },
  (_, i) => {
    const template = grammarTemplates[i % grammarTemplates.length];
    const difficulty: GrammarExercise["difficulty"] =
      i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard";

    const subject = grammarSubjects[i % grammarSubjects.length];
    const question = template.stem.replace("{subject}", subject);
    const options = rotateOptions(template.options, i % template.options.length);

    return {
      id: `fallback-grammar-${i + 1}`,
      question,
      options,
      correct_answer: template.correct,
      explanation: template.explanation,
      difficulty,
      category: template.category,
      created_at: now,
    };
  }
);

const vocabBase: Array<{
  word: string;
  definition: string;
  distractors: string[];
  sentence: string;
  partOfSpeech: string;
  category: string;
}> = [
  {
    word: "meticulous",
    definition: "very careful and precise",
    distractors: ["careless", "vague", "hurried"],
    sentence: "She is meticulous when auditing reports.",
    partOfSpeech: "adjective",
    category: "adjective",
  },
  {
    word: "mitigate",
    definition: "to make less severe",
    distractors: ["intensify", "ignore", "delay"],
    sentence: "City trees help mitigate extreme summer heat.",
    partOfSpeech: "verb",
    category: "verb",
  },
  {
    word: "abundant",
    definition: "existing in large quantities",
    distractors: ["scarce", "minimal", "rare"],
    sentence: "The valley has abundant natural resources.",
    partOfSpeech: "adjective",
    category: "adjective",
  },
  {
    word: "coherent",
    definition: "logical and consistent",
    distractors: ["confusing", "random", "fragmented"],
    sentence: "Her argument was coherent from start to finish.",
    partOfSpeech: "adjective",
    category: "adjective",
  },
  {
    word: "allocate",
    definition: "to distribute resources for a purpose",
    distractors: ["waste", "hide", "borrow"],
    sentence: "The team decided to allocate funds to training.",
    partOfSpeech: "verb",
    category: "verb",
  },
  {
    word: "insight",
    definition: "a deep understanding of a situation",
    distractors: ["confusion", "silence", "mistake"],
    sentence: "The survey gave insight into student habits.",
    partOfSpeech: "noun",
    category: "noun",
  },
  {
    word: "rapidly",
    definition: "at high speed",
    distractors: ["slowly", "carelessly", "rarely"],
    sentence: "Technology evolves rapidly in modern industries.",
    partOfSpeech: "adverb",
    category: "adverb",
  },
  {
    word: "resilient",
    definition: "able to recover quickly from difficulty",
    distractors: ["fragile", "rigid", "passive"],
    sentence: "A resilient mindset supports long-term learning.",
    partOfSpeech: "adjective",
    category: "adjective",
  },
];

export const FALLBACK_VOCABULARY_EXERCISES: VocabularyExercise[] = Array.from(
  { length: VOCAB_TARGET },
  (_, i) => {
    const base = vocabBase[i % vocabBase.length];
    const options = rotateOptions([base.word, ...base.distractors], i % 4);
    const difficulty: VocabularyExercise["difficulty"] =
      i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard";

    return {
      id: `fallback-vocab-${i + 1}`,
      word: base.word,
      definition: base.definition,
      options,
      correct_answer: base.word,
      example_sentence: base.sentence,
      part_of_speech: base.partOfSpeech,
      difficulty,
      category: base.category,
      created_at: now,
    };
  }
);

const readingThemes = [
  "education",
  "technology",
  "health",
  "business",
  "environment",
  "science",
  "society",
  "communication",
];

const readingDifficulties: Array<ReadingPassage["difficulty"]> = ["easy", "medium", "hard"];

const makeReadingQuestions = (passageId: string, theme: string, idx: number): ReadingQuestion[] => {
  const mainIdea = `${theme} improvement depends on consistent strategy and review`;
  const detail = `the plan includes measurement and adjustment over time`;
  const inference = `long-term results improve when actions are sustained`;

  return [
    {
      id: `fallback-reading-q-${idx}-1`,
      passage_id: passageId,
      question: "What is the main idea of the passage?",
      options: [
        mainIdea,
        "Instant results are always guaranteed",
        "Only expensive tools make progress possible",
        "Planning is unnecessary for success",
      ],
      correct_answer: mainIdea,
      question_type: "main-idea",
      created_at: now,
    },
    {
      id: `fallback-reading-q-${idx}-2`,
      passage_id: passageId,
      question: "Which detail is explicitly mentioned?",
      options: [
        detail,
        "Progress is random and cannot be tracked",
        "The strategy avoids all feedback",
        "Outcomes are evaluated once a decade",
      ],
      correct_answer: detail,
      question_type: "detail",
      created_at: now,
    },
    {
      id: `fallback-reading-q-${idx}-3`,
      passage_id: passageId,
      question: "What can be inferred from the passage?",
      options: [
        inference,
        "Shortcuts always outperform steady practice",
        "Consistency reduces all effort to zero",
        "Reading comprehension is unrelated to context",
      ],
      correct_answer: inference,
      question_type: "inference",
      created_at: now,
    },
  ];
};

export const FALLBACK_READING_CONTENT: Array<ReadingPassage & { questions: ReadingQuestion[] }> = Array.from(
  { length: READING_TARGET },
  (_, i) => {
    const theme = readingThemes[i % readingThemes.length];
    const difficulty = readingDifficulties[i % readingDifficulties.length];
    const passageId = `fallback-reading-${i + 1}`;

    const passage: ReadingPassage = {
      id: passageId,
      title: `Reading Practice ${i + 1}: ${theme.charAt(0).toUpperCase()}${theme.slice(1)}`,
      content:
        `This passage explores ${theme} through a practical learning lens. ` +
        `It explains how consistent routines, regular feedback, and small measurable goals ` +
        `create stronger outcomes over time. In this scenario, learners compare strategies, ` +
        `identify what works, and refine their approach with each review cycle. ` +
        `The overall message is that sustained practice, not isolated effort, drives meaningful progress. ` +
        `(Passage set ${Math.floor(i / readingThemes.length) + 1})`,
      difficulty,
      category: theme,
      created_at: now,
    };

    return {
      ...passage,
      questions: makeReadingQuestions(passageId, theme, i + 1),
    };
  }
);
