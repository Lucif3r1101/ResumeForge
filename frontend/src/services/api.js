import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

export const analyzeResume = async (formData, userId) => {
  const response = await API.post("/api/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(userId ? { "x-user-id": userId } : {}),
    },
  });

  return response.data;
};

export const submitFeedback = async (payload, userId) => {
  const response = await API.post("/api/feedback", payload, {
    headers: userId ? { "x-user-id": userId } : {},
  });
  return response.data;
};

export const getHistory = async (userId) => {
  const response = await API.get("/api/history", {
    headers: userId ? { "x-user-id": userId } : {},
  });
  return response.data;
};
