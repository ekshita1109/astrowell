const round = (n, decimals = 0) => {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
};

// Returns null for an empty list.
const average = (numbers) =>
  numbers.length ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : null;

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

module.exports = { round, average, clamp };