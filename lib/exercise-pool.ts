export const expandExercisePool = <T>(
  exercises: T[],
  variants: number,
  buildVariant: (exercise: T, variantIndex: number) => T
): T[] => {
  const expanded: T[] = [];

  for (let variantIndex = 0; variantIndex < variants; variantIndex += 1) {
    for (const exercise of exercises) {
      expanded.push(buildVariant(exercise, variantIndex));
    }
  }

  return expanded;
};