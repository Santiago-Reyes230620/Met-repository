import { getLocalDateKey } from "@/lib/date-utils";

export const getTodaySeed = (): string => {
  return getLocalDateKey();
};

const createSeededRandom = (seed: string) => {
  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  return () => {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    return hash / 4294967296;
  };
};

export const dailyShuffle = <T,>(items: T[], scope: string): T[] => {
  const cloned = [...items];
  const random = createSeededRandom(`${scope}:${getTodaySeed()}`);

  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }

  return cloned;
};

export const uniqueBy = <T,>(items: T[], keySelector: (item: T) => string): T[] => {
  const seen = new Set<string>();
  const unique: T[] = [];

  for (const item of items) {
    const key = keySelector(item);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  return unique;
};
