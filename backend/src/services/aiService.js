import axios from "axios";

const ML_BASE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

export const analyzeWithAI = async (resumeText, jobDescription) => {
  console.log("analyzeWithAI function triggered");

  try {
    console.log("Calling Python ML service...");

    const response = await axios.post(
      `${ML_BASE_URL}/analyze`,
      {
        resume: resumeText,
        job_description: jobDescription
      }
    );

    console.log("Python response received:", response.data);

    return response.data;

  } catch (error) {
    console.error("Python ML Service Error:", error.message);

    return {
      score: 0,
      matched: [],
      missing: [],
      suggestions: ["ML service unavailable."]
    };
  }
};
