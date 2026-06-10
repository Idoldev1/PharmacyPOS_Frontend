const KNOWN_INTERACTIONS: Record<string, string[]> = {
  warfarin: ["aspirin", "ibuprofen", "naproxen"],
  metformin: ["alcohol"],
  simvastatin: ["clarithromycin", "erythromycin"],
};

export const checkInteractions = (drugA: string, drugB: string): boolean => {
  const a = drugA.toLowerCase();
  const b = drugB.toLowerCase();
  return (
    KNOWN_INTERACTIONS[a]?.includes(b) || KNOWN_INTERACTIONS[b]?.includes(a) || false
  );
};
