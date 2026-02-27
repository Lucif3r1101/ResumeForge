import axios from "axios";

export const analyzeWithAI = async (resumeText, jobDescription) => {
  console.log("analyzeWithAI function triggered");

  try {
    console.log("Calling Python ML service...");

    const response = await axios.post(
      "http://127.0.0.1:8000/analyze",
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