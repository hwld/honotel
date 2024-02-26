const rollOnce = (i: number, min: number, max: number): number => {
  const result = Math.floor(Math.random() * (max - min) + min);
  return result;
};

export const rollTheDice = (
  rolls: number,
  min: number,
  max: number
): number[] => {
  const results = [...new Array(rolls)].map((_, i) => rollOnce(i, min, max));
  return results;
};
