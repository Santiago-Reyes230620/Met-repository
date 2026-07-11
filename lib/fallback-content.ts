import { GrammarExercise, ReadingPassage, ReadingQuestion, VocabularyExercise } from "@/lib/supabase/client";

const createdAt = new Date().toISOString();

const rotateOptions = (options: string[], shift: number): string[] => {
  const length = options.length;
  if (length === 0) return options;

  const offset = ((shift % length) + length) % length;
  return [...options.slice(offset), ...options.slice(0, offset)];
};

const grammarTemplates: Array<{
  stem: string;
  options: string[];
  correct: string;
  explanation: string;
  category: GrammarExercise["category"];
}> = [
  {
    stem: "{subject} ___ to the office every weekday.",
    options: ["go", "goes", "going", "gone"],
    correct: "goes",
    explanation: "Use present simple third-person singular for he, she, or it.",
    category: "verb-tenses",
  },
  {
    stem: "If we ___ earlier, we would catch the first train.",
    options: ["leave", "left", "will leave", "had left"],
    correct: "left",
    explanation: "Second conditional uses if + past simple, then would + base verb.",
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

const grammarRoles = [
  "manager",
  "student",
  "engineer",
  "coach",
  "analyst",
  "doctor",
  "designer",
  "researcher",
  "professor",
  "assistant",
  "teacher",
  "director",
  "writer",
  "pharmacist",
  "architect",
  "lawyer",
  "translator",
  "counselor",
  "scientist",
  "journalist",
  "librarian",
  "marketer",
  "coordinator",
  "musician",
  "mechanic",
  "pilot",
  "chef",
  "supervisor",
  "entrepreneur",
  "trainer",
  "developer",
  "consultant",
  "reviewer",
  "organizer",
  "volunteer",
  "planner",
  "student leader",
  "editor",
  "historian",
  "guide",
  "customer",
  "recipient",
  "speaker",
  "traveler",
  "visitor",
];

const grammarModifiers = [
  "",
  "senior",
  "junior",
  "lead",
  "assistant",
  "regional",
  "project",
  "temporary",
  "experienced",
  "new",
  "busy",
  "dedicated",
];

const grammarSubjects = grammarModifiers.flatMap((modifier) =>
  grammarRoles.map((role) => (modifier ? `The ${modifier} ${role}` : `The ${role}`))
);

export const buildFallbackGrammarExercises = (count = 2500): GrammarExercise[] => {
  const exercises: GrammarExercise[] = [];

  const difficulties = ["easy", "medium", "hard"] as const;

  for (let subjectIndex = 0; subjectIndex < grammarSubjects.length; subjectIndex++) {
    const subject = grammarSubjects[subjectIndex];

    for (let templateIndex = 0; templateIndex < grammarTemplates.length; templateIndex++) {
      const template = grammarTemplates[templateIndex];

      for (let difficultyIndex = 0; difficultyIndex < difficulties.length; difficultyIndex++) {
        if (exercises.length >= count) {
          return exercises;
        }

        const difficulty = difficulties[difficultyIndex];
        const variation = subjectIndex * grammarTemplates.length + templateIndex + difficultyIndex;

        exercises.push({
          id: `fallback-grammar-${exercises.length + 1}`,
          question: template.stem.replace("{subject}", subject),
          options: rotateOptions(template.options, variation),
          correct_answer: template.correct,
          explanation: template.explanation,
          difficulty,
          category: template.category,
          created_at: createdAt,
        });
      }
    }
  }

  return exercises;
};

const vocabularyEntries: Array<{
  word: string;
  definition: string;
  sentence: string;
  partOfSpeech: string;
  category: string;
}> = [
  { word: "meticulous", definition: "very careful and precise", sentence: "She is meticulous when auditing reports.", partOfSpeech: "adjective", category: "adjective" },
  { word: "mitigate", definition: "to make less severe", sentence: "City trees help mitigate extreme summer heat.", partOfSpeech: "verb", category: "verb" },
  { word: "abundant", definition: "existing in large quantities", sentence: "The valley has abundant natural resources.", partOfSpeech: "adjective", category: "adjective" },
  { word: "coherent", definition: "logical and consistent", sentence: "Her argument was coherent from start to finish.", partOfSpeech: "adjective", category: "adjective" },
  { word: "allocate", definition: "to distribute resources for a purpose", sentence: "The team decided to allocate funds to training.", partOfSpeech: "verb", category: "verb" },
  { word: "insight", definition: "a deep understanding of a situation", sentence: "The survey gave insight into student habits.", partOfSpeech: "noun", category: "noun" },
  { word: "rapidly", definition: "at high speed", sentence: "Technology evolves rapidly in modern industries.", partOfSpeech: "adverb", category: "adverb" },
  { word: "resilient", definition: "able to recover quickly from difficulty", sentence: "A resilient mindset supports long-term learning.", partOfSpeech: "adjective", category: "adjective" },
  { word: "lucid", definition: "clear and easy to understand", sentence: "Her explanation was lucid and helpful.", partOfSpeech: "adjective", category: "adjective" },
  { word: "duplicate", definition: "an exact copy", sentence: "Please avoid creating a duplicate file.", partOfSpeech: "noun", category: "noun" },
  { word: "adaptable", definition: "able to adjust to new conditions", sentence: "The most adaptable employees learn quickly.", partOfSpeech: "adjective", category: "adjective" },
  { word: "concise", definition: "short and clearly expressed", sentence: "The summary was concise and accurate.", partOfSpeech: "adjective", category: "adjective" },
  { word: "evaluate", definition: "to judge or assess", sentence: "We evaluate progress every Friday.", partOfSpeech: "verb", category: "verb" },
  { word: "reluctant", definition: "hesitant or unwilling", sentence: "He was reluctant to change his routine.", partOfSpeech: "adjective", category: "adjective" },
  { word: "incentive", definition: "something that motivates action", sentence: "A bonus can be a strong incentive.", partOfSpeech: "noun", category: "noun" },
  { word: "pragmatic", definition: "practical rather than idealistic", sentence: "She took a pragmatic approach to the problem.", partOfSpeech: "adjective", category: "adjective" },
  { word: "obscure", definition: "not well known or difficult to understand", sentence: "The meaning of the phrase was obscure.", partOfSpeech: "adjective", category: "adjective" },
  { word: "credible", definition: "believable and trustworthy", sentence: "We need a credible source for the report.", partOfSpeech: "adjective", category: "adjective" },
  { word: "expand", definition: "to increase in size or scope", sentence: "The company plans to expand into new markets.", partOfSpeech: "verb", category: "verb" },
  { word: "fundamental", definition: "basic and essential", sentence: "Reading is a fundamental skill.", partOfSpeech: "adjective", category: "adjective" },
  { word: "sufficient", definition: "enough for a particular purpose", sentence: "We have sufficient evidence to move forward.", partOfSpeech: "adjective", category: "adjective" },
  { word: "vivid", definition: "bright, clear, or detailed", sentence: "The writer used vivid descriptions.", partOfSpeech: "adjective", category: "adjective" },
  { word: "transform", definition: "to change completely", sentence: "Technology can transform how we learn.", partOfSpeech: "verb", category: "verb" },
  { word: "narrow", definition: "limited in width or scope", sentence: "The hallway was narrow and dark.", partOfSpeech: "adjective", category: "adjective" },
  { word: "notion", definition: "an idea or belief", sentence: "She rejected the notion that success is immediate.", partOfSpeech: "noun", category: "noun" },
  { word: "swift", definition: "moving very quickly", sentence: "The response was swift and effective.", partOfSpeech: "adjective", category: "adjective" },
  { word: "thrive", definition: "to grow or develop successfully", sentence: "Students thrive with regular practice.", partOfSpeech: "verb", category: "verb" },
  { word: "relief", definition: "a feeling of comfort after difficulty", sentence: "He felt relief after finishing the exam.", partOfSpeech: "noun", category: "noun" },
  { word: "adhere", definition: "to stick firmly or follow closely", sentence: "Always adhere to the schedule.", partOfSpeech: "verb", category: "verb" },
  { word: "skeptical", definition: "not easily convinced", sentence: "She was skeptical about the claim.", partOfSpeech: "adjective", category: "adjective" },
  { word: "coincide", definition: "to happen at the same time", sentence: "Our meetings often coincide with lunch.", partOfSpeech: "verb", category: "verb" },
  { word: "metaphor", definition: "a figure of speech comparing two things", sentence: "The teacher explained the metaphor clearly.", partOfSpeech: "noun", category: "noun" },
  { word: "restore", definition: "to bring back to a former state", sentence: "The team worked to restore the old building.", partOfSpeech: "verb", category: "verb" },
  { word: "clarify", definition: "to make something clearer", sentence: "Could you clarify the instructions?", partOfSpeech: "verb", category: "verb" },
  { word: "portion", definition: "a part of a whole", sentence: "Only a portion of the article was relevant.", partOfSpeech: "noun", category: "noun" },
  { word: "sustain", definition: "to support or maintain over time", sentence: "Exercise helps sustain energy levels.", partOfSpeech: "verb", category: "verb" },
  { word: "precise", definition: "exact and accurate", sentence: "Her measurements were precise.", partOfSpeech: "adjective", category: "adjective" },
  { word: "deliberate", definition: "carefully thought out", sentence: "The team made a deliberate decision.", partOfSpeech: "adjective", category: "adjective" },
  { word: "persuade", definition: "to convince someone to do something", sentence: "She tried to persuade him to apply.", partOfSpeech: "verb", category: "verb" },
  { word: "maintain", definition: "to keep something in good condition", sentence: "We maintain the platform regularly.", partOfSpeech: "verb", category: "verb" },
  { word: "accurate", definition: "free from mistakes", sentence: "The report was accurate and complete.", partOfSpeech: "adjective", category: "adjective" },
  { word: "efficient", definition: "working well without wasting time or energy", sentence: "The new system is more efficient.", partOfSpeech: "adjective", category: "adjective" },
  { word: "temporary", definition: "lasting for a limited time", sentence: "The closure is only temporary.", partOfSpeech: "adjective", category: "adjective" },
  { word: "complex", definition: "made of many parts; not simple", sentence: "It was a complex problem to solve.", partOfSpeech: "adjective", category: "adjective" },
  { word: "contrast", definition: "to compare differences", sentence: "The essay contrasts two viewpoints.", partOfSpeech: "verb", category: "verb" },
  { word: "benefit", definition: "an advantage or positive effect", sentence: "Exercise has many long-term benefits.", partOfSpeech: "noun", category: "noun" },
  { word: "analyze", definition: "to examine carefully", sentence: "We analyze the results every week.", partOfSpeech: "verb", category: "verb" },
  { word: "approach", definition: "a way of dealing with something", sentence: "Her approach was practical and calm.", partOfSpeech: "noun", category: "noun" },
  { word: "context", definition: "the situation around something", sentence: "The meaning depends on context.", partOfSpeech: "noun", category: "noun" },
  { word: "highlight", definition: "to emphasize or draw attention to", sentence: "The speaker highlighted three risks.", partOfSpeech: "verb", category: "verb" },
  { word: "interpret", definition: "to explain the meaning of", sentence: "Students must interpret the chart correctly.", partOfSpeech: "verb", category: "verb" },
  { word: "reliable", definition: "dependable and trustworthy", sentence: "We need reliable data for the report.", partOfSpeech: "adjective", category: "adjective" },
  { word: "relevant", definition: "closely connected to the matter at hand", sentence: "Only relevant evidence should be used.", partOfSpeech: "adjective", category: "adjective" },
  { word: "estimate", definition: "to approximate the value of something", sentence: "Can you estimate the total cost?", partOfSpeech: "verb", category: "verb" },
  { word: "expandable", definition: "capable of becoming larger", sentence: "The storage system is expandable.", partOfSpeech: "adjective", category: "adjective" },
  { word: "modify", definition: "to change slightly", sentence: "We can modify the plan if needed.", partOfSpeech: "verb", category: "verb" },
  { word: "concentrate", definition: "to focus attention on", sentence: "Try to concentrate on the main idea.", partOfSpeech: "verb", category: "verb" },
  { word: "clarity", definition: "the quality of being clear", sentence: "The explanation lacked clarity.", partOfSpeech: "noun", category: "noun" },
  { word: "strategy", definition: "a plan of action", sentence: "The team changed its strategy.", partOfSpeech: "noun", category: "noun" },
  { word: "subtle", definition: "not obvious, but important", sentence: "There was a subtle difference in meaning.", partOfSpeech: "adjective", category: "adjective" },
  { word: "adapt", definition: "to adjust to new conditions", sentence: "Students adapt quickly with practice.", partOfSpeech: "verb", category: "verb" },
  { word: "efficiently", definition: "in a way that avoids wasted time or effort", sentence: "She worked efficiently under pressure.", partOfSpeech: "adverb", category: "adverb" },
  { word: "sensitive", definition: "aware of and responsive to others", sentence: "He was sensitive to feedback.", partOfSpeech: "adjective", category: "adjective" },
  { word: "expand", definition: "to make or become larger", sentence: "The brand plans to expand abroad.", partOfSpeech: "verb", category: "verb" },
  { word: "foundation", definition: "the base or underlying support", sentence: "Grammar is the foundation of language study.", partOfSpeech: "noun", category: "noun" },
  { word: "distinguish", definition: "to recognize differences between things", sentence: "Can you distinguish the two ideas?", partOfSpeech: "verb", category: "verb" },
  { word: "emphasize", definition: "to give special importance to", sentence: "The instructor emphasized accuracy.", partOfSpeech: "verb", category: "verb" },
  { word: "concise", definition: "using few words while still clear", sentence: "Keep the answer concise and direct.", partOfSpeech: "adjective", category: "adjective" },
];

export const buildFallbackVocabularyExercises = (count = 4500): VocabularyExercise[] => {
  const total = Math.min(count, 4500);

  return Array.from({ length: total }, (_, index) => {
    const baseEntry = vocabularyEntries[index % vocabularyEntries.length];
    const cycle = Math.floor(index / vocabularyEntries.length);
    const entry = cycle === 0
      ? baseEntry
      : {
          ...baseEntry,
          word: `${baseEntry.word} (${cycle + 1})`,
          sentence: `${baseEntry.sentence} (Set ${cycle + 1})`,
        };

    const distractors = vocabularyEntries
      .filter((candidate, candidateIndex) => candidateIndex !== (index % vocabularyEntries.length))
      .map((candidate) => candidate.definition);

    const startIndex = index % distractors.length;
    const selectedDistractors = Array.from({ length: 3 }, (_, offset) => {
      return distractors[(startIndex + offset) % distractors.length];
    });
    const options = rotateOptions([entry.definition, ...selectedDistractors], index);
    const difficulty: VocabularyExercise["difficulty"] = index % 3 === 0 ? "easy" : index % 3 === 1 ? "medium" : "hard";

    return {
      id: `fallback-vocab-${index + 1}`,
      word: entry.word,
      definition: entry.definition,
      options,
      correct_answer: entry.definition,
      example_sentence: entry.sentence,
      part_of_speech: entry.partOfSpeech,
      difficulty,
      category: entry.category,
      created_at: createdAt,
    };
  });
};

const readingThemes = ["education", "technology", "health", "business", "environment", "science", "society", "communication"];
const readingDifficulties: Array<ReadingPassage["difficulty"]> = ["easy", "medium", "hard"];

const buildReadingQuestions = (passageId: string, theme: string, index: number): ReadingQuestion[] => {
  const mainIdea = `${theme} improvement depends on consistent strategy and review`;
  const detail = `the plan includes measurement and adjustment over time`;
  const inference = `long-term results improve when actions are sustained`;

  return [
    {
      id: `fallback-reading-q-${index}-1`,
      passage_id: passageId,
      question: "What is the main idea of the passage?",
      options: [mainIdea, "Instant results are always guaranteed", "Only expensive tools make progress possible", "Planning is unnecessary for success"],
      correct_answer: mainIdea,
      question_type: "main-idea",
      created_at: createdAt,
    },
    {
      id: `fallback-reading-q-${index}-2`,
      passage_id: passageId,
      question: "Which detail is explicitly mentioned?",
      options: [detail, "Progress is random and cannot be tracked", "The strategy avoids all feedback", "Outcomes are evaluated once a decade"],
      correct_answer: detail,
      question_type: "detail",
      created_at: createdAt,
    },
    {
      id: `fallback-reading-q-${index}-3`,
      passage_id: passageId,
      question: "What can be inferred from the passage?",
      options: [inference, "Shortcuts always outperform steady practice", "Consistency reduces all effort to zero", "Reading comprehension is unrelated to context"],
      correct_answer: inference,
      question_type: "inference",
      created_at: createdAt,
    },
  ];
};

export const buildFallbackReadingContent = (count = 600): Array<ReadingPassage & { questions: ReadingQuestion[] }> => {
  return Array.from({ length: count }, (_, index) => {
    const theme = readingThemes[index % readingThemes.length];
    const difficulty = readingDifficulties[index % readingDifficulties.length];
    const passageId = `fallback-reading-${index + 1}`;

    const passage: ReadingPassage = {
      id: passageId,
      title: `Reading Practice ${index + 1}: ${theme.charAt(0).toUpperCase()}${theme.slice(1)}`,
      content:
        `This passage explores ${theme} through a practical learning lens. ` +
        `It explains how consistent routines, regular feedback, and small measurable goals ` +
        `create stronger outcomes over time. In this scenario, learners compare strategies, ` +
        `identify what works, and refine their approach with each review cycle. ` +
        `The overall message is that sustained practice, not isolated effort, drives meaningful progress. ` +
        `(Passage set ${Math.floor(index / readingThemes.length) + 1})`,
      difficulty,
      category: theme,
      created_at: createdAt,
    };

    return {
      ...passage,
      questions: buildReadingQuestions(passageId, theme, index + 1),
    };
  });
};
