const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'for',
  'from',
  'has',
  'have',
  'he',
  'her',
  'hers',
  'him',
  'his',
  'i',
  'if',
  'in',
  'is',
  'it',
  'its',
  'me',
  'my',
  'of',
  'on',
  'or',
  'our',
  'ours',
  'she',
  'so',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'to',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'who',
  'will',
  'with',
  'you',
  'your',
  'yours',
]);

const ENGLISH_HINT_WORDS = new Set([
  'a',
  'about',
  'and',
  'are',
  'be',
  'for',
  'from',
  'have',
  'how',
  'i',
  'in',
  'is',
  'it',
  'my',
  'of',
  'on',
  'or',
  'that',
  'the',
  'this',
  'to',
  'was',
  'we',
  'what',
  'when',
  'with',
  'you',
  'your',
]);

const SPANISH_HINT_WORDS = new Set([
  'a',
  'acerca',
  'al',
  'algun',
  'algunas',
  'algunos',
  'como',
  'con',
  'de',
  'del',
  'el',
  'en',
  'esta',
  'este',
  'es',
  'eso',
  'esta',
  'estas',
  'estos',
  'la',
  'las',
  'le',
  'los',
  'mi',
  'no',
  'para',
  'por',
  'que',
  'se',
  'su',
  'sus',
  'tambien',
  'te',
  'un',
  'una',
  'usted',
  'yo',
  'y',
]);

export const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const tokenizeText = (value: string) => {
  const normalized = normalizeText(value);
  if (!normalized) return [];

  return normalized.split(' ').filter(Boolean);
};

export const extractMeaningfulTerms = (value: string, minLength = 4) => {
  const terms = tokenizeText(value).filter((term) => term.length >= minLength && !STOP_WORDS.has(term));
  return Array.from(new Set(terms));
};

export const countPhraseMatches = (text: string, terms: string[]) => {
  const normalizedText = normalizeText(text);

  if (!normalizedText || terms.length === 0) return 0;

  return terms.filter((term) => normalizedText.includes(normalizeText(term))).length;
};

export const getLanguageSignals = (value: string) => {
  const words = tokenizeText(value);
  const englishHits = words.filter((word) => ENGLISH_HINT_WORDS.has(word)).length;
  const spanishHits = words.filter((word) => SPANISH_HINT_WORDS.has(word)).length;

  return {
    englishHits,
    spanishHits,
    likelyEnglish: englishHits >= 2 && englishHits >= spanishHits,
  };
};

export const isLikelyEnglishText = (value: string) => getLanguageSignals(value).likelyEnglish;