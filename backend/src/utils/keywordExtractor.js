export const extractKeywords = (text) => {
  const words = text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/);

  const stopWords = new Set([
    "the", "and", "or", "a", "an", "to", "of", "in",
    "for", "with", "on", "at", "by", "is", "are"
  ]);

  return [...new Set(words.filter(word => word.length > 3 && !stopWords.has(word)))];
};
