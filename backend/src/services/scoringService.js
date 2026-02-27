export const calculateATSScore = (resumeText, jdKeywords) => {
  const matchedKeywords = jdKeywords.filter(keyword =>
    resumeText.includes(keyword)
  );

  const score = Math.round(
    (matchedKeywords.length / jdKeywords.length) * 100
  );

  const missingKeywords = jdKeywords.filter(
    keyword => !resumeText.includes(keyword)
  );

  return {
    score: isNaN(score) ? 0 : score,
    matchedKeywords,
    missingKeywords
  };
};
