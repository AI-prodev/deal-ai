export type HookData = { id: number; hooks: any[]; language?: string };

export const getUniqueGenerations = (generations: any[]): HookData[] => {
  const uniqueGenerations: any[] = [];
  const seenIds = new Set<number>();

  generations.forEach(generation => {
    if (!seenIds.has(generation.id)) {
      seenIds.add(generation.id);
      uniqueGenerations.push(generation);
    }
  });

  return uniqueGenerations;
};
